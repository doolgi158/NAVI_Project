package com.navi.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/*
 * 항공편별 좌석 현황 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatStatusDTO {
    private String flightId;
    private String airlineName;
    private long totalSeats;
    private long availableSeats;
    private long economyTotal;
    private long economyAvailable;
    private long prestigeTotal;
    private long prestigeAvailable;
}
