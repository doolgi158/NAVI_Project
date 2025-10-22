package com.navi.flight.admin.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAirportDTO {
    private String airportCode;   // 공항 코드
    private String airportName;   // 공항 이름
}
