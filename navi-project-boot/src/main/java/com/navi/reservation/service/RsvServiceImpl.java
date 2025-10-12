package com.navi.reservation.service;

import com.navi.accommodation.dto.request.AccRsvRequestDTO;
import com.navi.accommodation.service.AccRsvService;
import com.navi.reservation.domain.Rsv;
import com.navi.reservation.domain.enums.PaymentMethod;
import com.navi.reservation.domain.enums.RsvStatus;
import com.navi.reservation.domain.enums.RsvType;
import com.navi.reservation.dto.request.RsvPreRequestDTO;
import com.navi.reservation.dto.response.RsvResponseDTO;
import com.navi.reservation.repository.RsvRepository;
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * ==============================================
 * [RsvServiceImpl]
 * : 예약 생성 및 결제 확정 서비스
 * ==============================================
 * ① createPendingReservation() : 결제 전 예약 임시 생성 (WAITING_PAYMENT)
 * ② confirmPaymentRsv()        : 결제 성공 시 예약 확정 (PAID) 및 상세 등록
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class RsvServiceImpl implements RsvService {
    private final RsvRepository rsvRepository;
    private final RsvCounterService counterService;
    private final UserRepository userRepository;

    /* === 관리자 기능 === */
    // 1. 전체 예약 목록 조회
    @Override
    public List<Rsv> findAllRsv() {
        return rsvRepository.findAll();
    }
    // 2. 예약 상태에 따른 숙소 조회
    @Override
    public List<Rsv> findRsvByStatus(String status) {
        RsvStatus rsvStatus = RsvStatus.valueOf(status.toUpperCase());
        return rsvRepository.findAllByRsvStatus(rsvStatus);
    }

    /* === 사용자 기능 === */
    // 1. 사용자별 예약 목록 조회
    @Override
    public List<Rsv> findAllByUserNo(Long no) {
        return rsvRepository.findAllByUser_No(no);
    }

    /* === 결제 로직 === */
    // 1. 결제 전 임시 예약 생성
    @Override
    @Transactional
    public Rsv createPendingReservation(RsvPreRequestDTO dto) {
        log.info("[RsvService] 예약 사전 생성 요청 - {}", dto);

        // 예약번호 생성 (YYYYMMDD + TYPE + seq)
        String reserveId = counterService.generateReserveId(dto.getRsvType());

        // 회원정보 조회
        User user = userRepository.findById(dto.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("비회원은 예약할 수 없습니다."));

        // 예약 엔티티 생성
        BigDecimal total = dto.getTotalAmount() != null ?
                BigDecimal.valueOf(dto.getTotalAmount()) : BigDecimal.ZERO;

        Rsv rsv = Rsv.builder()
                .reserveId(reserveId)
                .user(user)
                .rsvType(dto.getRsvType())
                .targetId(dto.getTargetId())
                .rsvStatus(RsvStatus.WAITING_PAYMENT)
                .paymentMethod(dto.getPaymentMethod())
                .totalAmount(total)
                .build();

        // DB 저장
        Rsv saved = rsvRepository.save(rsv);
        log.info("[RsvService] 예약 임시 생성 완료 → reserveId={}", reserveId);
        return saved;
    }

    // 2. 결제 검증 완료 후 예약 확정(상세 예약 생성)
    @Override
    @Transactional
    public RsvResponseDTO confirmPaymentRsv(String reserveId, String impUid, String paymentMethod) {
        log.info("[RsvService] 결제 검증 완료 - 예약 확정 처리 시작 reserveId={}", reserveId);

        // 예약 조회
        Rsv rsv = rsvRepository.findByReserveId(reserveId)
                .orElseThrow(() -> new IllegalArgumentException("해당 예약 정보를 찾을 수 없습니다."));

        // 결제 상태 변경
        PaymentMethod method = PaymentMethod.from(paymentMethod);
        rsv.markAsPaid(impUid, method);
        Rsv saved = rsvRepository.save(rsv);
        log.info("[RsvService] 예약 상태 변경 완료 → reserveId={}, status={}", reserveId, saved.getRsvStatus());

        // 응답 DTO 변환
        return RsvResponseDTO.fromEntity(saved);
    }

    // 3. 결제 검증 실패 시 예약 취소
    @Override
    @Transactional
    public RsvResponseDTO cancelPayment(String reserveId, String reason) {
        log.warn("[RsvService] 결제 검증 실패 - 예약 취소 처리 시작 reserveId={}, reason={}", reserveId, reason);

        // 예약 조회
        Rsv rsv = rsvRepository.findByReserveId(reserveId)
                .orElseThrow(() -> new IllegalArgumentException("해당 예약 정보를 찾을 수 없습니다."));

        // 이미 취소 or 완료된 예약인지 체크
        if (rsv.getRsvStatus() == RsvStatus.CANCELLED || rsv.getRsvStatus() == RsvStatus.FAILED) {
            log.warn("[RsvService] 이미 취소된 예약입니다 - reserveId={}", reserveId);
            return RsvResponseDTO.fromEntity(rsv);
        }

        // 상태 변경 및 실패 사유 등록
        rsv.markAsCancelled(reason);
        rsvRepository.save(rsv);

        log.info("[RsvService] 예약 취소 완료 - reserveId={}, status={}", reserveId, rsv.getRsvStatus());
        return RsvResponseDTO.fromEntity(rsv);
    }

    // 4. 결제 실패 시 예약 해제
    @Override
    @Transactional
    public void failPayment(String reserveId, String reason) {
        log.warn("[RsvService] 결제 실패 처리 시작 reserveId={}, reason={}", reserveId, reason);

        // 예약 조회
        Rsv rsv = rsvRepository.findByReserveId(reserveId)
                .orElseThrow(() -> new IllegalArgumentException("해당 예약 정보를 찾을 수 없습니다."));

        // 이미 결제 성공 or 취소 상태면 무시
        if (rsv.getRsvStatus() == RsvStatus.PAID || rsv.getRsvStatus() == RsvStatus.CANCELLED) {
            log.warn("[RsvService] 결제 실패 처리 스킵 (이미 확정/취소된 예약) - reserveId={}", reserveId);
            return;
        }

        // 상태 변경
        rsv.markAsFailed(reason);
        rsvRepository.save(rsv);

        log.info("[RsvService] 결제 실패 처리 완료 - reserveId={}, status={}", reserveId, rsv.getRsvStatus());
    }

    @Override
    @Transactional
    public RsvResponseDTO updateReadyStatus(String reserveId) {
        log.info("[RsvService] 입금 대기 상태로 변경 reserveId={}", reserveId);

        Rsv rsv = rsvRepository.findByReserveId(reserveId)
                .orElseThrow(() -> new IllegalArgumentException("해당 예약 정보를 찾을 수 없습니다."));

        rsv.markReady();
        Rsv updated = rsvRepository.save(rsv);

        return RsvResponseDTO.fromEntity(updated);
    }
}
