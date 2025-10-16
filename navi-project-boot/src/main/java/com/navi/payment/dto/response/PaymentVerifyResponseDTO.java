package com.navi.payment.dto.response;

import com.navi.common.enums.RsvStatus;
import lombok.*;

import java.math.BigDecimal;

/* ===============[PaymentVerifyResponseDTO]===============
       PortOne 서버에서 받은 결제 검증 결과를 프론트에 반환
      EX) 결제 완료 후 포트원 서버에 검증 요청 후 받는 응답객체
   ======================================================*/

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyResponseDTO {
    private boolean success;    // 결제 검증 결과 (true: 성공, false: 실패)
    private String message;     // 사용자에게 보여줄 메시지
    //private String merchantId;  // 결제 고유번호 (예: PAY20251017-0001)
}
