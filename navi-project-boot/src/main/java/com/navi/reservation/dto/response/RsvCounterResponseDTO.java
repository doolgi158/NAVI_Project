package com.navi.reservation.dto.response;

/*
 * ====================================
 * [RsvCounterResponseDTO]
 * : 예약번호 카운터 조회 응답 DTO (관리자용)
 * ====================================
 */

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RsvCounterResponseDTO {
    private String counterDate;     // 카운터 기준 날짜 (예: 20251007)
    private String targetType;      // 예약 대상 구분 (예: ACC, AIR, DLV)
    private Integer nextSeq;        // 초기 시퀀스 번호 (예: 1)
}
