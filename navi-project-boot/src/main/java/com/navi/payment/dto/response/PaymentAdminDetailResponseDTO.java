package com.navi.payment.dto.response;

import com.navi.payment.domain.PaymentDetail;
import com.navi.payment.domain.enums.PaymentMethod;
import com.navi.payment.domain.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAdminDetailResponseDTO {
    private String reserveId;               // 예약 ID
    private BigDecimal amount;              // 결제 금액
    private BigDecimal feeAmount;           // 항목별 수수료
    private PaymentStatus paymentStatus;    // 결제 상태
    private LocalDateTime createdAt;       // 생성일
    private LocalDateTime updatedAt;       // 수정일
    private String reason;                 // 취소/실패 사유

    public static PaymentAdminDetailResponseDTO fromEntity(PaymentDetail detail) {
        return PaymentAdminDetailResponseDTO.builder()
                .reserveId(detail.getReserveId())
                .amount(detail.getAmount())
                .feeAmount(detail.getFeeAmount())
                .paymentStatus(detail.getPaymentStatus())
                .createdAt(detail.getCreatedAt())
                .updatedAt(detail.getUpdatedAt())
                .reason(detail.getReason())
                .build();
    }
}
