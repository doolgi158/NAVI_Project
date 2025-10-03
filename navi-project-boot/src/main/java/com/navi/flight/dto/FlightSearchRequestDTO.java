package com.navi.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 항공편 검색 조건 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightSearchRequestDTO {
    private String depAirportNm;   // 출발 공항명
    private String arrAirportNm;   // 도착 공항명
    private String depDate;        // yyyy-MM-dd (출발일)
    private String arrDate;        // yyyy-MM-dd (복귀일 - 왕복일 경우)
    private String seatClass;      // ECONOMY / BUSINESS (필수)

    @Builder.Default
    private Integer page = 1;

    @Builder.Default
    private Integer size = 10;
}
