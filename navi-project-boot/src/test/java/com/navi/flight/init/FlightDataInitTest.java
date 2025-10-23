package com.navi.flight.init;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.flight.domain.Airport;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import com.navi.flight.repository.AirportRepository;
import com.navi.flight.repository.FlightRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@SpringBootTest
class FlightDataInitTest {

    @Autowired private AirportRepository airportRepository;
    @Autowired private FlightRepository flightRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    /*
     * 전체 초기화: 공항 시드 → 항공편 삽입
     * 좌석은 지연생성(SeatService 경로에서 필요 시 생성) 그대로 둠.
     */
    @Test
    @Transactional
    @Commit
    void initAirportsAndFlights() throws Exception {
        seedAirportsIfEmpty();   // 1) 공항 초기 데이터
        insertFlightsIfEmpty();  // 2) 항공편 초기 데이터
    }

    /* 1) 공항 초기 데이터 삽입 (airports.json) */
    private void seedAirportsIfEmpty() throws Exception {
        if (airportRepository.count() > 0) {
            log.info("공항 이미 존재: {}건 → 시드 스킵", airportRepository.count());
            return;
        }

        try (InputStream in = getClass().getResourceAsStream("/mockData/airports.json")) {
            if (in == null) throw new IllegalStateException("/mockData/airports.json not found");
            JsonNode root = mapper.readTree(in);
            JsonNode items = root.path("response").path("body").path("items").path("item");

            List<Airport> batch = new ArrayList<>();
            for (JsonNode it : items) {
                String code = it.path("airportCode").asText();
                String name = it.path("airportName").asText();
                if (code == null || code.isBlank() || name == null || name.isBlank()) continue;

                batch.add(Airport.builder()
                        .airportCode(code)
                        .airportName(name)
                        .build());
            }
            airportRepository.saveAll(batch);
            log.info("공항 시드 완료: {}건", batch.size());
        }
    }

    /* 2) 항공편 초기 데이터 삽입 (flightData_1010_1108.json) */
    private void insertFlightsIfEmpty() throws Exception {
        if (flightRepository.count() > 0) {
            log.info("항공편 이미 존재: {}건 → 초기화 스킵", flightRepository.count());
            return;
        }

        try (InputStream in = getClass().getResourceAsStream("/mockData/flightData_1010_1108.json")) {
            if (in == null) throw new IllegalStateException("/mockData/flightData_1010_1108.json not found");
            JsonNode root = mapper.readTree(in);
            JsonNode items = root.path("response").path("body").path("items").path("item");

            List<Flight> toSave = new ArrayList<>();
            for (JsonNode it : items) {
                try {
                    String airlineNm = it.path("airlineNm").asText();
                    String depNm = it.path("depAirportNm").asText(); // ex) 김포, 부산(김해) 이슈 주의
                    String arrNm = it.path("arrAirportNm").asText();

                    // 공항명 매핑 (부산 → 김해(부산) 등)
                    Airport depAirport = resolveAirportByApiName(depNm);
                    Airport arrAirport = resolveAirportByApiName(arrNm);

                    // 시간 파싱: 공공데이터 형식(yyyyMMddHHmm) → LocalDateTime
                    LocalDateTime depTime = parseYmdHM(it.path("depPlandTime").asText());
                    LocalDateTime arrTime = parseYmdHM(it.path("arrPlandTime").asText());

                    String vehicle = it.path("vihicleId").asText(); // 항공편 번호 (예: 7C4770)
                    Integer economy = it.path("economyCharge").isNumber() ? it.path("economyCharge").asInt() : 0;
                    Integer prestige = it.path("prestigeCharge").isNumber() ? it.path("prestigeCharge").asInt() : null;

                    FlightId id = FlightId.builder()
                            .flightId(vehicle)
                            .depTime(depTime)
                            .build();

                    Flight flight = Flight.builder()
                            .flightId(id)
                            .airlineNm(airlineNm)
                            .depAirport(depAirport)  // Airport 엔티티 참조
                            .arrAirport(arrAirport)  // Airport 엔티티 참조
                            .arrTime(arrTime)
                            .economyCharge(economy != null ? economy : 0)
                            .prestigeCharge(prestige)
                            .build();

                    toSave.add(flight);
                } catch (Exception e) {
                    log.warn("항공편 레코드 변환 실패: {}", e.getMessage());
                }
            }
            flightRepository.saveAll(toSave);
            log.info("항공편 초기 데이터 삽입 완료: {}건", toSave.size());
        }
    }

    /* 공항명 → Airport 엔티티 매핑 (부산/김해 케이스 처리) */
    private Airport resolveAirportByApiName(String apiName) {
        if (apiName == null) throw new IllegalArgumentException("공항명이 null");
        // 공공데이터에서 '부산' 이라고 내려오면 DB에는 '김해(부산)'로 저장되어 있으므로 보정
        if ("부산".equals(apiName) || "김해".equals(apiName)) {
            return airportRepository.findByAirportName("김해(부산)")
                    .orElseThrow(() -> new IllegalArgumentException("공항 없음: 김해(부산)"));
        }
        return airportRepository.findByAirportName(apiName)
                .orElseGet(() -> airportRepository.findByAirportNameContaining(apiName)
                        .orElseThrow(() -> new IllegalArgumentException("공항 없음: " + apiName)));
    }

    /* yyyyMMddHHmm → LocalDateTime */
    private LocalDateTime parseYmdHM(String ymdhm) {
        if (ymdhm == null || ymdhm.isBlank()) throw new IllegalArgumentException("시간 포맷 누락");
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyyMMddHHmm");
        return LocalDateTime.parse(ymdhm, fmt);
    }
}
