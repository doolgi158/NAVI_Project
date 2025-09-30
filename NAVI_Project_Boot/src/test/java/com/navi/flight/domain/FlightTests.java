package com.navi.flight.domain;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.flight.dto.FlightDTO;
import com.navi.flight.repository.FlightRepository;
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
    private FlightRepository flightRepository;

    @Test
    void flightJsonTest() throws Exception {
        InputStream is = getClass().getResourceAsStream("/mockData/flightData.json)");
        JsonNode root = objectMapper.readTree(is);
        JsonNode items = root.path("response").path("body").path("items").path("item");

        List<FlightDTO> dtoList = objectMapper.readValue(
                items.toString(),
                new TypeReference<List<FlightDTO>>() {
                }
        );

        for(FlightDTO dto : dtoList) {
            Flight flight = Flight.builder()
                    .id(new FlightId(dto.getVihicleId(),
                            LocalDateTime.parse(dto.getDepPlandTime().toString(), DateTimeFormatter.ofPattern("yyyyMMddHHmm"))
                    ))
                    .airlineNm(dto.getAirlineNm())
                    .depAirportNm(dto.getDepAirportNm())
                    .arrAirportNm(dto.getArrAirportNm())
                    .arrTime(LocalDateTime.parse(dto.getArrPlandTime().toString(), DateTimeFormatter.ofPattern("yyyyMMddHHmm")))
                    .economyCharge(dto.getEconomyCharge())
                    .prestigeCharge(dto.getPrestigeCharge())
                    .build();
            flightRepository.save(flight);
        }
    }
}
