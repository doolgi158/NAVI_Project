package com.navi.flight.domain;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.flight.dto.ApiFlightDTO;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.service.AirportService;
import com.navi.flight.service.FlightService;
import com.navi.flight.service.SeatService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;

/**
 * ✈️ FlightTests (지연 좌석 생성 구조 + DB 커밋 버전)
 *
 * ✅ 주요 변경점:
 *  - @Transactional + @Commit 추가 → 롤백 방지
 *  - 저장 로그(log.info) 추가 → 실제 insert 여부 콘솔로 확인
 *  - seatService 호출로 좌석 최초 생성 검증
 */
@Slf4j
@SpringBootTest
@Transactional
@Commit // ✅ 테스트 종료 후 commit 수행 (rollback 방지)
public class FlightTests {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FlightService flightService; // 항공편 저장 담당 (좌석 생성 X)

    @Autowired
    private AirportService airportService; // 공항 데이터 저장 담당

    @Autowired
    private SeatService seatService; // 좌석 지연 생성 담당

    @Autowired
    private FlightRepository flightRepository; // 검증용 직접 접근

    @Test
    void flightJsonTest() throws Exception {
        // 1️⃣ 공항 데이터 로드 및 저장
        log.info("🌐 공항 데이터 로드 시작");
        airportService.loadAirportData();
        long airportCount = airportService.countAirports();
        log.info("✅ 공항 데이터 저장 완료: {}건", airportCount);

        // 2️⃣ mockData/flightData.json 로드
        InputStream is = getClass().getResourceAsStream("/mockData/flightData.json");
        JsonNode root = objectMapper.readTree(is);
        JsonNode items = root.path("response").path("body").path("items").path("item");

        List<ApiFlightDTO> dtoList = objectMapper.readValue(
                items.toString(),
                new TypeReference<List<ApiFlightDTO>>() {}
        );

        // 3️⃣ 항공편 저장 (이 시점에는 좌석 생성되지 않음)
        log.info("✈️ 항공편 데이터 저장 시작 — 총 {}건", dtoList.size());
        for (ApiFlightDTO dto : dtoList) {
            try {
                flightService.saveFlight(dto);
                log.info("✅ 항공편 저장 완료 — 편명: {}", dto.getVihicleId());
            } catch (Exception e) {
                log.error("⚠️ 항공편 저장 실패 — 편명: {}, 사유: {}", dto.getVihicleId(), e.getMessage());
            }
        }

        // 4️⃣ 저장된 항공편 수 확인
        long flightCount = flightService.countFlights();
        log.info("✅ 항공편 저장 완료: {}건", flightCount);

        // 5️⃣ 특정 항공편 하나 가져와 좌석 생성 시도
        Flight sampleFlight = flightRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("❌ 저장된 항공편 없음"));

        log.info("🪑 좌석 생성 시도 — 편명: {}, 출발시각: {}",
                sampleFlight.getId().getFlightId(),
                sampleFlight.getId().getDepTime());

        seatService.createSeatsIfNotExists(sampleFlight);

        // 6️⃣ 다시 호출 (중복 생성 방지)
        seatService.createSeatsIfNotExists(sampleFlight);

        // 7️⃣ 상태 확인
        log.info("✅ 좌석 생성 완료 여부: {}", sampleFlight.isSeatInitialized());

        // 8️⃣ 검증
        Assertions.assertTrue(airportCount > 0, "공항 데이터가 있어야 함");
        Assertions.assertTrue(flightCount > 0, "항공편이 저장되어야 함");
        Assertions.assertTrue(sampleFlight.isSeatInitialized(), "좌석이 생성되어야 함");

        log.info("🎉 FlightTests 완료 — DB 커밋됨 (rollback X)");
    }
}
