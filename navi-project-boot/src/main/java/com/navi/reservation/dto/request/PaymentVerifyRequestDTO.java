package com.navi.reservation.dto.request;

import lombok.*;

/**
 * =======================================================
 * [PaymentVerifyRequestDTO]
 * : 프론트에서 결제 완료 후 백엔드로 전달해 PortOne 검증 요청 DTO
 * =======================================================
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyRequestDTO {
    private String impUid;          // 결제 고유 번호
    private String merchantUid;     // 예약 ID
    private Integer amount;         // 결제 금액
}
