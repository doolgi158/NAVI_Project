package com.navi.payment.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.navi.common.enums.RsvType;
import com.navi.payment.domain.enums.PaymentMethod;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyRequestDTO {
    private RsvType rsvType;
    private List<String> reserveId;
    private String impUid;
    private String merchantId;
    private BigDecimal totalAmount;
    private PaymentMethod paymentMethod;

    /* === 결제 상세 정보 === */
    @JsonAlias({"items", "paymentItems"})
    private List<PaymentConfirmRequestDTO.ReservePaymentItem> items; // 예약별 금액 리스트

    /* === 결제 확정 DTO 변환 === */
    public PaymentConfirmRequestDTO toConfirmRequest() {
        return PaymentConfirmRequestDTO.builder()
                .merchantId(merchantId)
                .rsvType(rsvType)
                .impUid(impUid)
                .paymentMethod(paymentMethod)
                .items(items)
                .build();
    }
}
