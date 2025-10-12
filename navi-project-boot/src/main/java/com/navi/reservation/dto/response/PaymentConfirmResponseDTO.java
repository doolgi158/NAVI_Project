package com.navi.reservation.dto.response;

import com.navi.reservation.domain.enums.PaymentMethod;
import com.navi.reservation.domain.enums.RsvStatus;
import com.navi.reservation.domain.enums.RsvType;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ===================================================
 * [PaymentConfirmResponseDTO]
 * : 결제 검증 이후 DB에 반영된 예약 확정 결과를 프론트로 반환
 * ===================================================
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentConfirmResponseDTO {
    private String reserveId;                   // 예약 번호
    private String targetId;                    // 대상 ID
    private RsvType rsvType;                    // 예약 유형
    private RsvStatus rsvStatus;                // 결제 상태
    private PaymentMethod paymentMethod;        // 결제 수단
    private Integer totalAmount;                // 결제 금액
    private LocalDateTime paymentTime;          // 결제 완료 시각
}