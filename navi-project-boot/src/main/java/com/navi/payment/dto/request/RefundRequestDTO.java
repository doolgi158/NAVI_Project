package com.navi.payment.dto.request;

import com.navi.common.enums.RsvType;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequestDTO {
    private String merchantId;     // 전체 환불 시 사용
    private String reserveId;      // 부분 환불 시 사용
    private RsvType rsvType;       // 예약 구분 (ACC, DLV, FLY)
    private String reason;         // 환불 사유
    private BigDecimal amount;     // 부분 환불 금액 명시 가능
}

