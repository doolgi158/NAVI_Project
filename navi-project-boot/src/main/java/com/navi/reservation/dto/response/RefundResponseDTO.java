package com.navi.reservation.dto.response;

import com.navi.reservation.domain.Refund;
import lombok.*;

import java.time.LocalDateTime;

/**
 * =======================
 * [RefundResponseDTO]
 * : 환불 처리 결과 응답 DTO
 * =======================
 * ㄴ 결제 검증 및 환불 처리 후 결과 반환
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundResponseDTO {
    private Long refundId;              // 환불 고유번호 (예: 101)
    private String reserveId;           // 예약 고유번호 (예: 20251007ACC001)
    private Integer originalAmount;     // 원결제금액 (예: 128000)
    private Integer feeAmount;          // 수수료금액 (예: 8000)
    private Integer amount;             // 실제환불금액 (예: 120000)
    private LocalDateTime refundDate;   // 환불일시 (예: 2025-10-07T15:31:45)
    private String reason;              // 환불사유 (예: "고객 요청에 따른 취소")
    private Refund.RefundStatus status; // 환불상태 (예: 환불요청, 환불진행, 환불완료, 환불거절)

    // Entity → DTO 변환 메서드
    public static RefundResponseDTO fromEntity(Refund entity) {
        return RefundResponseDTO.builder()
                .refundId(entity.getRefundId())
                .reserveId(entity.getRsv().getReserveId())
                .originalAmount(entity.getOriginalAmount())
                .feeAmount(entity.getFeeAmount())
                .amount(entity.getAmount())
                .refundDate(entity.getRefundDate())
                .reason(entity.getReason())
                .status(entity.getStatus())
                .build();
    }
}
