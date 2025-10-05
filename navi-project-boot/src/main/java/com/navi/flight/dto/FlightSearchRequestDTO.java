package com.navi.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 항공편 검색 조건 DTO
 * - 클라이언트에서 조회 조건을 보낼 때 사용
 * - 공항명 대신 코드(GMP, CJU ...)를 기준으로 검색
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightSearchRequestDTO {
    private String depAirportCode;   // 출발 공항 코드 (예: GMP)
    private String arrAirportCode;   // 도착 공항 코드 (예: CJU)
    private String depDate;          // yyyy-MM-dd (출발일)
    private String arrDate;          // yyyy-MM-dd (왕복일 경우)
    private String depTime;          // HH:mm (선택)
    private String arrTime;          // HH:mm (선택)
    private String seatClass;        // ECONOMY / PRESTIGE

    @Builder.Default
    private Integer page = 1;        // 페이지 번호
    @Builder.Default
    private Integer size = 10;       // 페이지당 항목 수
}
