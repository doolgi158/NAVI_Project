package com.navi.reservation.dto.request;

import com.navi.reservation.domain.enums.PaymentMethod;
import com.navi.reservation.domain.enums.RsvType;
import lombok.*;

/**
 * ==============================
 * [RsvConfirmRequestDTO]
 * : 결제 검증 후 예약 확정 단계 DTO
 * ==============================
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RsvConfirmRequestDTO {
    private Long userNo;                        // 예약자 회원번호
    private RsvType rsvType;                    // 예약 유형
    private String targetId;                    // 예약 대상 ID
    private PaymentMethod paymentMethod;        // 결제 수단
    private Integer totalAmount;                // 총 결제 금액
    private String paymentId;                   // 결제 승인 번호(imp_uid)
}