package com.navi.flight.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.flight.domain.Airport;
import com.navi.flight.dto.ApiAirportDTO;
import com.navi.flight.repository.AirportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AirportServiceImpl implements AirportService {

    private final AirportRepository airportRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void loadAirportData() {
        try {
            // 리소스의 airports.json 파일 읽기
            InputStream is = getClass().getResourceAsStream("/mockData/airports.json");
            JsonNode root = objectMapper.readTree(is);
            JsonNode items = root.path("response").path("body").path("items").path("item");

            // JSON → DTO 변환
            List<ApiAirportDTO> dtoList = objectMapper.readValue(
                    items.toString(),
                    new TypeReference<List<ApiAirportDTO>>() {}
            );

            // DTO → Entity 변환 후 저장
            for (ApiAirportDTO dto : dtoList) {
                Airport airport = Airport.builder()
                        .airportCode(dto.getAirportCode())   // JSON: airportCode → DB: airport_code
                        .airportName(dto.getAirportName())   // JSON: airportName → DB: airport_name
                        .build();

                // 중복 체크 후 저장
                if (!airportRepository.existsById(airport.getAirportCode())) {
                    airportRepository.save(airport);
                }
            }
            System.out.println("공항 데이터 저장 완료: " + airportRepository.count());

        } catch (Exception e) {
            throw new RuntimeException("공항 데이터 로드 실패", e);
        }
    }

    @Override
    public long countAirports() {
        return airportRepository.count();
    }

    @Override
    public String getAirportCodeByName(String airportName) {
        return airportRepository.findByAirportName(airportName)
                .map(Airport::getAirportCode)
                .orElseThrow(() -> new RuntimeException("해당 이름의 공항을 찾을 수 없습니다: " + airportName));
    }

    @Override
    public Airport getAirportByCode(String airportCode) {
        return airportRepository.findById(airportCode)
                .orElseThrow(() -> new RuntimeException("해당 코드의 공항을 찾을 수 없습니다: " + airportCode));
    }
}
