package com.navi.flight.domain;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.flight.dto.ApiFlightDTO;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.repository.SeatRepository;
import com.navi.flight.service.FlightService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@SpringBootTest
public class FlightTests {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FlightService flightService; // ✅ 서비스 호출해야 좌석 자동 생성됨

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Test
    void flightJsonTest() throws Exception {
        InputStream is = getClass().getResourceAsStream("/mockData/flightData.json)");
        JsonNode root = objectMapper.readTree(is);
        JsonNode items = root.path("response").path("body").path("items").path("item");

        List<ApiFlightDTO> dtoList = objectMapper.readValue(
                items.toString(),
                new TypeReference<List<ApiFlightDTO>>() {}
        );

        for (ApiFlightDTO dto : dtoList) {
            Flight flight = Flight.builder()
                    .id(new FlightId(
                            dto.getVihicleId(),
                            LocalDateTime.parse(dto.getDepPlandTime().toString(),
                                    DateTimeFormatter.ofPattern("yyyyMMddHHmm"))
                    ))
                    .airlineNm(dto.getAirlineNm())
                    .depAirportNm(dto.getDepAirportNm())
                    .arrAirportNm(dto.getArrAirportNm())
                    .arrTime(LocalDateTime.parse(dto.getArrPlandTime().toString(),
                            DateTimeFormatter.ofPattern("yyyyMMddHHmm")))
                    .economyCharge(dto.getEconomyCharge())
                    .prestigeCharge(dto.getPrestigeCharge())
                    .build();

            // ✅ 여기서 서비스로 저장해야 좌석까지 생성됨
            flightService.saveFlight(flight);
        }

        // ✅ 확인용 로그
        System.out.println("총 항공편 수: " + flightRepository.count());
        System.out.println("총 좌석 수: " + seatRepository.count());
    }
}
