package com.navi.reservation.dto.response;

import lombok.*;

/* ===============[PaymentVerifyResponseDTO]===============
      PortOne 서버에서 받은 결제 검증 결과를 프론트에 반환
      EX) 결제 완료 후 포트원 서버에 검증 요청 후 받는 응답객체
   ======================================================*/

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyResponseDTO {
    private String impUid;        // 포트원 결제 ID
    private String merchantUid;   // 주문번호 (= reserveId)
    private String status;        // 결제 상태
    private String message;       // 검증 결과 메시지
    private Integer amount;       // 결제 금액
    private String payMethod;     // 결제 수단
    private String pgProvider;    // PG사

    // 결제 성공 시에만 포함되는 예약 정보
    private RsvResponseDTO rsvResponse;
}