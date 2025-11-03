package com.navi.flight.init;

import com.navi.flight.domain.Airport;
import com.navi.flight.service.AirportService;
import com.navi.flight.service.ApiFlightService;
import com.navi.flight.service.FlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class FlightDataInit {

    private final AirportService airportService;
    private final FlightService flightService;
    private final ApiFlightService apiFlightService;

    /**
     * IATA 코드 매핑 (API → DB)
     */
    private static final Map<String, String> AIRPORT_ID_TO_IATA = new HashMap<>();

    static {
        AIRPORT_ID_TO_IATA.put("NAARKPC", "CJU"); // 제주
        AIRPORT_ID_TO_IATA.put("NAARKSI", "ICN"); // 인천
        AIRPORT_ID_TO_IATA.put("NAARKSS", "GMP"); // 김포
        AIRPORT_ID_TO_IATA.put("NAARKPK", "PUS"); // 부산
        AIRPORT_ID_TO_IATA.put("NAARKJJ", "KWJ"); // 광주
        AIRPORT_ID_TO_IATA.put("NAARKJY", "RSU"); // 여수
        AIRPORT_ID_TO_IATA.put("NAARKTU", "CJJ"); // 청주
        AIRPORT_ID_TO_IATA.put("NAARKTH", "KPO"); // 포항
        AIRPORT_ID_TO_IATA.put("NAARKTN", "TAE"); // 대구
        AIRPORT_ID_TO_IATA.put("NAARKPU", "USN"); // 울산
        AIRPORT_ID_TO_IATA.put("NAARKNY", "YNY"); // 양양
        AIRPORT_ID_TO_IATA.put("NAARKNW", "WJU"); // 원주
        AIRPORT_ID_TO_IATA.put("NAARKJK", "KUV"); // 군산
        AIRPORT_ID_TO_IATA.put("NAARKJB", "MWX"); // 무안
    }

    @Bean
    public ApplicationRunner initFlights() {
        return args -> {

            // 1️⃣ 공항 초기화
            if (airportService.countAirports() == 0) {
                log.info("[Init] 공항 데이터 없음 → API 호출 시작");
                var apiAirports = airportService.fetchAirportDataFromApi();

                for (var dto : apiAirports) {
                    String iata = AIRPORT_ID_TO_IATA.get(dto.getAirportId());
                    if (iata == null) {
                        log.warn("[Init] 매핑되지 않은 공항 ID: {}", dto.getAirportId());
                        continue;
                    }
                    Airport airport = Airport.builder()
                            .airportCode(iata)
                            .airportName(dto.getAirportNm())
                            .build();
                    airportService.saveAirport(airport);
                    log.info("[Init] 공항 저장: {} / {}", iata, dto.getAirportNm());
                }

                log.info("[Init] 공항 저장 완료");
            } else {
                log.info("[Init] 공항 데이터 존재 → 초기화 생략");
            }

            // 2️⃣ 항공편 초기화
            if (flightService.countFlights() == 0) {
                log.info("[Init] 항공편 초기화 시작");
                apiFlightService.initFlightsNext30Days(); // 좌석 지연 생성 포함
                log.info("[Init] 오늘부터 30일치 제주 항공편 저장 완료");
            } else {
                log.info("[Init] 이미 항공편 존재 → 초기화 생략");
            }
        };
    }
}
