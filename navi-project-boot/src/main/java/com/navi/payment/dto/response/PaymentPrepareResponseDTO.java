package com.navi.payment.dto.response;

import lombok.*;

/* =========[PaymentPrepareResponseDTO]=========
        결제 준비 완료 후 프론트에 반환되는 DTO
       EX) 프론트는 이 merchantId를 PG로 전달함
   ============================================ */

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentPrepareResponseDTO {
    private String merchantId;  // 결제 고유 번호(예: PAY20251017-0001)
}
