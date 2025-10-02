package com.navi.flight.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * 항공편 검색 결과 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightDetailResponseDTO {
    private String flightNo;
    private String airlineNm;
    private String depAirportNm;
    private String arrAirportNm;
    private LocalDateTime depTime;
    private LocalDateTime arrTime;
    private int price;
    private String seatClass; // ECONOMY or BUSINESS
}
