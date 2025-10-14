package com.navi.reservation.dto.request;

import com.navi.reservation.domain.enums.PaymentMethod;
import com.navi.reservation.domain.enums.RsvType;
import lombok.*;

/**
 * ==============================
 * [RsvPreRequestDTO]
 * : 결제 전 예약 정보 입력 단계 DTO
 * ==============================
 * ㄴ 사용자가 결제창을 띄우기 전에 입력한 예약 데이터를 전달
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RsvPreRequestDTO {
    private Long userNo;                        // 예약자 회원번호 (예: 1)
    private RsvType rsvType;                    // 예약 유형 (예: ACC, AIR, DLV)
    private String targetId;                    // 예약 대상 ID (예: ACC003)
    private PaymentMethod paymentMethod;        // 결제 수단 (예: KAKAOPAY)
    private Integer totalAmount;                // 결제 금액 (예: 200000)
}