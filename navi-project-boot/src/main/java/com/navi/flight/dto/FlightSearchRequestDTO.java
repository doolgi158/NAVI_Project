package com.navi.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightSearchRequestDTO {
    private String depAirportCode;   // 출발 공항 코드
    private String arrAirportCode;   // 도착 공항 코드
    private String depDate;          // yyyy-MM-dd
    private String arrDate;          // yyyy-MM-dd (왕복일 경우)
    private String depTime;          // HH:mm
    private String arrTime;          // HH:mm
    private String seatClass;        // ECONOMY / PRESTIGE

    @Builder.Default
    private Integer page = 1;
    @Builder.Default
    private Integer size = 10;
}
