package com.navi.flight.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
@Builder
public class AirportDTO {
    private String airportId;
    private String airportNm;
}
