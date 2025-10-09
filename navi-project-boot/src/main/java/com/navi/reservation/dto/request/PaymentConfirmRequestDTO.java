package com.navi.reservation.dto.request;

import com.navi.reservation.domain.PaymentMethod;
import com.navi.reservation.domain.RsvType;
import lombok.*;

/**
 * ========================================
 * [PaymentConfirmRequestDTO]
 * : 결제 검증 이후 예약 확정 단계 DTO(DB 반영)
 * ========================================
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentConfirmRequestDTO {
    private Long userNo;                        // 예약자 회원번호
    private RsvType rsvType;                    // 예약 유형 (ACC, AIR, DLV)
    private String targetId;                    // 예약 대상 ID
    private PaymentMethod paymentMethod;        // 결제 수단
    private Integer totalAmount;                // 총 결제 금액
    private String reserveId;                   // 예약 고유번호 (merchant_uid)
    private String paymentId;                   // 결제 승인번호 (imp_uid)
}
