package com.navi.payment.dto.response;

import com.navi.common.enums.RsvType;
import com.navi.payment.domain.PaymentMaster;
import com.navi.payment.domain.enums.PaymentMethod;
import com.navi.payment.domain.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAdminListResponseDTO {
    private String merchantId;             // 결제 고유번호
    private RsvType rsvType;               // 결제 유형 (ACC / FLY / DLV)
    private PaymentStatus paymentStatus;   // 결제 상태
    private PaymentMethod paymentMethod;   // 결제 수단
    private BigDecimal totalAmount;        // 총 결제 금액
    private BigDecimal totalFeeAmount;     // 환불(수수료) 금액
    private LocalDateTime createdAt;       // 결제 생성일시
    private LocalDateTime updatedAt;       // 결제 수정일시
    private String reason;                 // 결제 취소/실패 사유

    public static PaymentAdminListResponseDTO fromEntity(PaymentMaster master) {
        return PaymentAdminListResponseDTO.builder()
                .merchantId(master.getMerchantId())
                .rsvType(
                        master.getPaymentDetails().isEmpty() ? null :
                                master.getPaymentDetails().get(0).getRsvType()
                )
                .paymentStatus(master.getPaymentStatus())
                .paymentMethod(master.getPaymentMethod())
                .totalAmount(master.getTotalAmount())
                .totalFeeAmount(master.getTotalFeeAmount())
                .createdAt(master.getCreatedAt())
                .updatedAt(master.getUpdatedAt())
                .reason(master.getReason())
                .build();
    }
}
