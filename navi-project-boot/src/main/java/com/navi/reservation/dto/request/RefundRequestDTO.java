package com.navi.reservation.dto.request;

import lombok.*;

/**
 * ===========================================
 * [RefundRequestDTO]
 * : 환불 요청 시 클라이언트에서 전달되는 데이터 DTO
 * ===========================================
 * ㄴ 예약 ID 기준으로 환불 요청
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequestDTO {
    private String reserveId;           // 예약 고유번호 (예: 20251007ACC001)
    private Integer originalAmount;     // 원결제금액 (예: 128000)
    private String reason;              // 환불사유 (예: "고객 요청에 따른 취소")
}
