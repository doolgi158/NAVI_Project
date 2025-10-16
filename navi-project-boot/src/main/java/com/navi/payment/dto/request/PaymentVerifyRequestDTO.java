package com.navi.payment.dto.request;

import com.navi.common.enums.RsvType;
import lombok.*;

import java.math.BigDecimal;

/* =============[PaymentVerifyRequestDTO]=============
            백엔드 → 포트원 결제 검증 요청 DTO
        EX) 결제 완료 후, 포트원 서버에 결제 검증 요청
   =================================================== */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyRequestDTO {
    private String impUid;              // PortOne PG 승인번호 (예: IMP_12345678)
    private String merchantId;         // PortOne 주문번호 (결제 고유번호 - merchantId)
    private BigDecimal totalAmount;     // 결제 금액
}
