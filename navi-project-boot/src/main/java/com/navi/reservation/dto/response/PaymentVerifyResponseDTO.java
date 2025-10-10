package com.navi.reservation.dto.response;

import lombok.*;

/**
 * =======================================================
 * [PaymentVerifyResponseDTO]
 * : PortOne 서버에서 받은 결제 검증 결과를 프론트에 반환
 * =======================================================
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyResponseDTO {
    private String impUid;        // 아임포트 결제번호
    private String merchantUid;   // 주문번호
    private String status;        // 결제 상태
    private Integer amount;       // 결제 금액
    private String payMethod;     // 결제 수단
    private String pgProvider;    // PG사
    private String message;       // 검증 결과 메시지
}
