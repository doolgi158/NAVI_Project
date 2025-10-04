package com.navi.flight.domain;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.flight.dto.ApiFlightDTO;
import com.navi.flight.service.AirportService;
import com.navi.flight.service.FlightService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.InputStream;
import java.util.List;

@SpringBootTest
public class FlightTests {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FlightService flightService; // 항공편 저장 + 좌석 자동 생성

    @Autowired
    private AirportService airportService; // 공항 데이터 저장

    /**
     * 1. mockData/airports.json → navi_airport 저장
     * 2. mockData/flightData.json → Flight + Seat 저장
     */
    @Test
    void flightJsonTest() throws Exception {
        // 1. 공항 데이터 로드
        airportService.loadAirportData();

        // 2. 항공편 데이터 로드
        InputStream is = getClass().getResourceAsStream("/mockData/flightData.json");
        JsonNode root = objectMapper.readTree(is);
        JsonNode items = root.path("response").path("body").path("items").path("item");

        List<ApiFlightDTO> dtoList = objectMapper.readValue(
                items.toString(),
                new TypeReference<List<ApiFlightDTO>>() {}
        );

        // 3. 항공편 저장 (좌석 자동 생성 포함)
        for (ApiFlightDTO dto : dtoList) {
            flightService.saveFlight(dto);
        }

        // 4. 서비스 계층 통해 카운트
        long airportCount = airportService.countAirports();
        long flightCount = flightService.countFlights();
        long seatCount = flightService.countSeats();

        System.out.println("총 공항 수: " + airportCount);
        System.out.println("총 항공편 수: " + flightCount);
        System.out.println("총 좌석 수: " + seatCount);

        // 5. 간단한 검증 추가
        Assertions.assertTrue(airportCount > 0, "공항이 저장되어야 함");
        Assertions.assertTrue(flightCount > 0, "항공편이 저장되어야 함");
        Assertions.assertTrue(seatCount > 0, "좌석이 자동 생성되어야 함");
    }
}
