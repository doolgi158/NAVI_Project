package com.navi.reservation.dto.request;

import lombok.*;

/* =============[PaymentVerifyRequestDTO]=============
            백엔드 → 포트원 결제 검증 요청 DTO
      EX) 결제 완료 후, 포트원 서버에 결제 검증 요청 객체
   =================================================== */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyRequestDTO {
    private String impUid;        // PortOne 결제 고유번호 (예: IMP_12345678)
    private String merchantUid;   // PortOne 주문번호 (merchant_uid = reserveId)
    private String reserveId;     // 내부 예약 ID (예: 20251012ACC001)
    private String payMethod;     // 결제수단
    private Integer amount;       // 결제 금액
}
