package com.navi.payment.dto.response;

import com.navi.common.enums.RsvStatus;
import lombok.*;

import java.util.List;

/* ================[PaymentResultResponseDTO]================
       결제 검증 및 확정 후 프론트에 반환되는 통합 응답 DTO
          PortOne 검증 결과 + DB 반영 결과를 함께 전달
   ========================================================== */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResultResponseDTO {
    /* === PG(PortOne) 검증 결과 === */
    private boolean success;        // 결제 성공 여부
    private String message;         // 사용자 메시지
    private String impUid;          // PG 승인번호
    private String merchantId;      // 결제 고유번호

    /* === DB 반영 결과 === */
    private List<String> reserveIds; // 예약 ID 리스트
    private RsvStatus rsvStatus;     // 예약 상태 (PAID / FAILED / REFUNDED)
}
