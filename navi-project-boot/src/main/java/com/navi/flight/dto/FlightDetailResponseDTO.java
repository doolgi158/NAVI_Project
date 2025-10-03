package com.navi.flight.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * 항공편 검색 결과 DTO
 * - DB Entity 그대로 노출하지 않고
 * - 필요한 값만 가공해서 반환
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightDetailResponseDTO {
    private String flightNo;         // 편명
    private String airlineNm;        // 항공사명
    private String depAirportCode;   // 출발 공항 코드 (예: GMP)
    private String depAirportName;   // 출발 공항명 (예: 김포)
    private String arrAirportCode;   // 도착 공항 코드 (예: CJU)
    private String arrAirportName;   // 도착 공항명 (예: 제주)
    private LocalDateTime depTime;   // 출발 일시
    private LocalDateTime arrTime;   // 도착 일시
    private int price;               // 선택한 좌석 등급 요금
    private String seatClass;        // ECONOMY / PRESTIGE
}
