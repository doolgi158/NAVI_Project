package com.navi.reservation.dto.request;

/*
 * ==================================
 * [RsvCounterRequestDTO]
 * : 예약번호 카운터 생성/초기화 요청 DTO
 * ==================================
 */

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RsvCounterRequestDTO {
    private String counterDate;     // 카운터 기준 날짜 (예: 20251007)
    private String targetType;      // 예약 대상 구분 (예: ACC, AIR, DLV)
    private Integer nextSeq;        // 초기 시퀀스 번호 (예: 1)
}
