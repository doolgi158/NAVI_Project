package com.navi.reservation.service;

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

    // 상세예약 서비스 (숙소 / 항공 / 배송)
    private final AccRsvService accRsvService;
    // private final AirRsvService airRsvService;
    // private final DlvRsvService dlvRsvService;

    /** === 관리자 기능 === */
    @Override
    public List<Rsv> findAllRsv() {
        return rsvRepository.findAll();
    }

    @Override
    public List<Rsv> findRsvByStatus(String status) {
        RsvStatus rsvStatus = RsvStatus.valueOf(status.toUpperCase());
        return rsvRepository.findAllByRsvStatus(rsvStatus);
    }

    /* 결제 전 예약 마스터 생성 (WAITING_PAYMENT 상태로 저장) */
    @Override
    @Transactional
    public Rsv createPendingReservation(RsvPreRequestDTO dto) {
        log.info("[RsvService] 예약 사전 생성 요청 - {}", dto);

        // 1. 예약번호 생성 (YYYYMMDD + TYPE + seq)
        String reserveId = counterService.generateReserveId(dto.getRsvType());

        // 2. 회원정보 조회
        User user = userRepository.findById(dto.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("비회원은 예약할 수 없습니다."));

        // 3. 예약 엔티티 생성
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

        // 4. DB 저장
        Rsv saved = rsvRepository.save(rsv);
        log.info("[RsvService] 예약 임시 생성 완료 → reserveId={}", reserveId);
        return saved;
    }

    /** ==================================================
     * ② 결제 검증 완료 후 예약 확정 (PAID)
     * ================================================== */
    @Override
    @Transactional
    public RsvResponseDTO confirmPaymentRsv(String reserveId, String impUid, String paymentMethod) {
        log.info("[RsvService] 결제 검증 완료 - 예약 확정 처리 시작 reserveId={}", reserveId);

        // 1️⃣ 예약 조회
        Rsv rsv = rsvRepository.findByReserveId(reserveId)
                .orElseThrow(() -> new IllegalArgumentException("해당 예약 정보를 찾을 수 없습니다."));

        // 2️⃣ 결제 정보 반영
        PaymentMethod method = PaymentMethod.from(paymentMethod);
        rsv.markAsPaid(impUid, method);
        Rsv saved = rsvRepository.save(rsv);
        log.info("[RsvService] 결제 정보 반영 완료 - reserveId={}, impUid={}, method={}",
                reserveId, impUid, method);

        // 3️⃣ 예약 타입별 상세 예약 생성 (결제 성공 이후에만)
        RsvType type = rsv.getRsvType();
        switch (type) {
            case ACC -> {
                accRsvService.createAccReservation(saved);
                log.info("[RsvService] 숙소 상세 예약 생성 완료 - reserveId={}", reserveId);
            }
            // case FLY -> airRsvService.createFlightReservation(saved);
            // case DLV -> dlvRsvService.createDeliveryReservation(saved);
            default -> log.warn("[RsvService] 상세 생성 스킵 - 지원하지 않는 타입: {}", type);
        }

        // 4️⃣ 응답 DTO 변환
        return RsvResponseDTO.fromEntity(saved);
    }

    /** === 사용자별 예약 전체 조회 === */
    @Override
    public List<Rsv> findAllByUserNo(Long userNo) {
        return rsvRepository.findAllByUser(userNo);
    }
}
