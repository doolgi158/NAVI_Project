package com.navi.reservation.service;

import com.navi.reservation.domain.Refund;
import com.navi.reservation.domain.Rsv;
import com.navi.reservation.dto.request.RefundRequestDTO;
import com.navi.reservation.dto.response.RefundResponseDTO;
import com.navi.reservation.repository.RefundRepository;
import com.navi.reservation.repository.RsvRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService{
    private final RefundRepository refundRepository;
    private final RsvRepository rsvRepository;

    /** === 관리자 기능 === */
    @Override
    public List<RefundResponseDTO> findAllRefunds() {
        return refundRepository.findAllRefunds()
                .stream()
                .map(RefundResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<RefundResponseDTO> findRefundsByStatus(Refund.RefundStatus status) {
        return refundRepository.findAllByStatus(status)
                .stream()
                .map(RefundResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional  // 데이터 일관성을 보장하는 장치
    public RefundResponseDTO updateRefundStatus(Long refundId, Refund.RefundStatus newStatus) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException("해당 환불 내역이 존재하지 않습니다."));

        switch (newStatus) {
            case 환불진행 -> refund.markAsProcessing();
            case 환불완료 -> refund.markAsCompleted();
            case 환불거절 -> refund.markAsDenied("관리자에 의해 환불 거절됨");
        }

        return RefundResponseDTO.fromEntity(refund);
    }

    /** === 사용자 기능 === */
    @Override
    @Transactional  // 데이터 일관성을 보장하는 장치
    public RefundResponseDTO requestRefund(RefundRequestDTO dto) {
        // 예약 정보 확인
        Rsv rsv = rsvRepository.findByReserveId(dto.getReserveId())
                .orElseThrow(() -> new IllegalArgumentException("해당 예약을 찾을 수 없습니다."));

        // 이미 환불 처리된 예약인지 확인
        if (refundRepository.existsByRsv(rsv)){
            throw new IllegalArgumentException("이미 환불 요청이 접수된 예약입니다.");
        }
        /*
        // 예약 상세 아직 안만들었음
        // 예약 상세에서 체크인 날짜 조회
        LocalDate checkInDate = AccRsvDetailRepository.findCheckInDateByReserveId(rsv.getReserveId())
                .orElseThrow(() -> new IllegalArgumentException("예약 상세 정보를 찾을 수 없습니다."));

        // 수수료 계산
        int fee = calculateFee(dto.getOriginalAmount(), checkInDate);
        */
        int fee = 0;    // 임시 처리
        int refundAmount = dto.getOriginalAmount() - fee;

        // 환불 엔티티 생성
        Refund refund = Refund.builder()
                .rsv(rsv)
                .originalAmount(dto.getOriginalAmount())
                .feeAmount(fee)
                .amount(refundAmount)
                .reason(dto.getReason())
                .status(Refund.RefundStatus.환불요청)
                .build();

        // 저장 및 반환
        refundRepository.save(refund);
        return RefundResponseDTO.fromEntity(refund);
    }

    @Override
    public RefundResponseDTO findByReserveId(String reserveId) {
        Refund refund = refundRepository.findByReserveId(reserveId)
                .orElseThrow(() -> new IllegalArgumentException("해당 예약의 환불 내역을 찾을 수 없습니다."));
        return RefundResponseDTO.fromEntity(refund);
    }

    /** === 내부 수수료 계산 로직 === */
    private int calculateFee(Integer originalAmount, LocalDate checkInDate) {
        if(originalAmount == null || checkInDate == null) return 0;

        LocalDate today = LocalDate.now();
        // 두 날짜 간의 차이를 계산하는 코드
        long daysBeforeCheckIn = ChronoUnit.DAYS.between(today, checkInDate);

        if (daysBeforeCheckIn >= 7) {
            return 0;  // 체크인 7일 전 → 수수료 없음
        } else if (daysBeforeCheckIn >= 3) {
            return (int) (originalAmount * 0.05); // 5%
        } else if (daysBeforeCheckIn >= 1) {
            return (int) (originalAmount * 0.10); // 10%
        } else {
            return (int) (originalAmount * 0.20); // 당일 취소 20%
        }
    }
}
