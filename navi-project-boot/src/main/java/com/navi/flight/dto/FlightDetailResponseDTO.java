package com.navi.flight.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightDetailResponseDTO {
    private String flightNo;
    private String airlineNm;
    private String depAirportCode;
    private String depAirportName;
    private String arrAirportCode;
    private String arrAirportName;
    private LocalDateTime depTime;
    private LocalDateTime arrTime;
    private int price;
    private String seatClass;
}
