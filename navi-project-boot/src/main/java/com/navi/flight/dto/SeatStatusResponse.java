package com.navi.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/*
 * 좌석 지연 생성 상태 응답 DTO
 * - React LazyDataLoader에서 폴링 시 사용
 * - {"initialized": true} 형태로 응답
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SeatStatusResponse {

    /*
     * 좌석 생성 완료 여부
     * - true: 좌석 생성 완료
     * - false: 아직 생성 중
     */
    private boolean initialized;
}
