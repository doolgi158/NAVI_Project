package com.navi.payment.dto.request;

import com.navi.common.enums.RsvType;
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

    public PaymentConfirmRequestDTO toConfirmRequest() {
        List<PaymentConfirmRequestDTO.ReservePaymentItem> items =
                this.reserveId.stream()
                        .map(id -> new PaymentConfirmRequestDTO.ReservePaymentItem(id, this.totalAmount))
                        .toList();

        return PaymentConfirmRequestDTO.builder()
                .merchantId(this.merchantId)
                .rsvType(this.rsvType)
                .impUid(this.impUid)
                .items(items)
                .build();
    }
}
