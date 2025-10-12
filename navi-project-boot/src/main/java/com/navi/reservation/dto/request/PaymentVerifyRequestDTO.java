package com.navi.reservation.dto.request;

import lombok.*;

/**
 * =======================================================
 * [PaymentVerifyRequestDTO]
 * : 프론트 → 백엔드 결제 검증 요청 DTO
 * =======================================================
 * ㄴ 아임포트에서 결제 완료 후, PortOne 서버에 impUid로 결제 검증 요청
 * ㄴ reserveId(우리 시스템 예약 ID)도 같이 전달해야 함
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyRequestDTO {
    private String impUid;        // ✅ PortOne 결제 고유번호 (IMP_12345678)
    private String merchantUid;   // ✅ PortOne 주문번호 (merchant_uid)
    private String reserveId;     // ✅ 내부 예약 ID (예: 20251012ACC001)
    private String payMethod;     // ✅ 결제수단 (kakaopay / card / tosspay)
    private Integer amount;       // ✅ 결제 금액
}
