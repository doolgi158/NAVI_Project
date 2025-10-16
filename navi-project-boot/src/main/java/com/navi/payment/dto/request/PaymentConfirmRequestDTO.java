package com.navi.payment.dto.request;

import com.navi.payment.domain.enums.PaymentMethod;
import com.navi.common.enums.RsvType;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/* =========[PaymentConfirmRequestDTO]=========
      결제 검증 이후 예약 확정 단계 DTO(DB 반영)
     EX) 결제 마스터는 UPDATE, 결제 상세는 INSERT
   ============================================ */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentConfirmRequestDTO {
    /* 결제 완료 시 */
    private String merchantId;                  // 결제 고유번호 (예: PAY20251012-0001)
    private RsvType reserveType;                // 예약 유형 (ACC, AIR, DLV)
    private List<String> reserveIds;            // 결제 대상 예약 ID 리스트 (예: ["20251012ACC001", "20251012ACC002"])
    private String impUid;                      // 결제 승인번호 (예: IMP_67283051)
    private PaymentMethod paymentMethod;        // 결제 수단 (예: KGINIPAY, KAKAOPAY, TOSSPAY)
    private BigDecimal totalAmount;             // 총 결제 금액 (예: 128000)

    /* 환불 발생 시 */
    private String refundReason;                // 환불사유 (예: "고객 요청에 따른 취소")
    private BigDecimal refundAmount;            // 실환불금액 (예: 120000)
}
