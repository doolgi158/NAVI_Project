package com.navi.flight.dto;

import lombok.Data;

/**
 * 공공데이터포털 API → JSON 매핑 DTO
 */
@Data
public class ApiAirportDTO {
    private String airportCode;   // JSON의 "airportCode"
    private String airportName;   // JSON의 "airportName"
}
