package com.navi.payment.dto.request;

import com.navi.common.enums.RsvType;
import com.navi.payment.domain.enums.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/* =======[PaymentPrepareRequestDTO]=======
       결제 요청 직전 (결제 ID 생성용) DTO
      EX) 사용자가 결제 버튼을 누를 때 호출됨
   ======================================== */

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentPrepareRequestDTO {
    private RsvType rsvType;
    private List<String> reserveId;
    private BigDecimal totalAmount;         // 총 결제 금액 (예: 128000)
    private PaymentMethod paymentMethod;    // 결제 수단 (예: KGINIPAY, KAKAOPAY, TOSSPAY)
}
