package com.navi.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiFlightDTO {

    private String vihicleId; //항공편 ID
    private String airlineNm; //항공사명
    private String depAirportNm; //출발 공항명(한글)
    private String arrAirportNm; //도착 공항명(한글)
    private Long depPlandTime; //출발 예정 시간 (연도 + 날짜 + 시간)
    private Long arrPlandTime; //도착 예정 시간
    private Integer economyCharge; //일반석 요금
    private Integer prestigeCharge; //프레스티지석 요금

}
