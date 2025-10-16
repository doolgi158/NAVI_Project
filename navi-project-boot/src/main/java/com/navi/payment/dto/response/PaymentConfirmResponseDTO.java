package com.navi.payment.dto.response;

import com.navi.common.enums.RsvStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/* =============[PaymentConfirmResponseDTO]=============
     결제 검증 이후 DB에 반영된 예약 확정 결과를 프론트로 반환
     EX) 결제 관련 테이블 정보 SELECT - 결제 완료 창에 활용
   ===================================================== */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentConfirmResponseDTO {
    private String merchantId;                  // 결제 번호
    private List<String> reserveIds;            // 예약 ID
    private RsvStatus rsvStatus;                // 결제 상태
    //private LocalDateTime createdAt;            // 결제 완료 시간
}