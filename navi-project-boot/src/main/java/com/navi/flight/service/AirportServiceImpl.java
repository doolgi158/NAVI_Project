package com.navi.flight.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.flight.domain.Airport;
import com.navi.flight.dto.AirportDTO;
import com.navi.flight.repository.AirportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AirportServiceImpl implements AirportService {

    private final AirportRepository airportRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper mapper;

    @Value("${api.flight.serviceKey}")
    private String serviceKey;

    @Override
    public void loadAirportData() {
        if (airportRepository.count() > 0) {
            log.info("[AirportService] 공항 데이터 이미 존재 → 초기화 생략");
            return;
        }

        log.info("[AirportService] 공항 데이터 API 호출 시작");

        String url = "http://apis.data.go.kr/1613000/DmstcFlightNvgInfoService/getArprtList?serviceKey="
                + serviceKey + "&_type=json";

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode items = mapper.readTree(response)
                    .path("response").path("body").path("items").path("item");

            List<Airport> airports = new ArrayList<>();
            if (items.isArray()) {
                for (JsonNode it : items) {
                    airports.add(Airport.builder()
                            .airportCode(it.path("airportId").asText())
                            .airportName(it.path("airportNm").asText())
                            .build());
                }
            }

            airportRepository.saveAll(airports);
            log.info("[AirportService] 공항 데이터 저장 완료: {}건", airports.size());
        } catch (Exception e) {
            throw new RuntimeException("[AirportService] 공항 데이터 API 호출 실패", e);
        }
    }

    @Override
    public long countAirports() {
        return airportRepository.count();
    }

    @Override
    public String getAirportIdByName(String airportName) {
        return airportRepository.findByAirportName(airportName)
                .map(Airport::getAirportCode)
                .orElseThrow(() -> new RuntimeException("해당 이름의 공항을 찾을 수 없습니다: " + airportName));
    }

    @Override
    public Airport getAirportByCode(String airportCode) {
        return airportRepository.findById(airportCode)
                .orElseThrow(() -> new RuntimeException("해당 코드의 공항을 찾을 수 없습니다: " + airportCode));
    }

    @Override
    public List<Airport> getAllAirports() {
        return airportRepository.findAll();
    }

    @Override
    public List<AirportDTO> fetchAirportDataFromApi() {
        String url = "http://apis.data.go.kr/1613000/DmstcFlightNvgInfoService/getArprtList?serviceKey="
                + serviceKey + "&_type=json";

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode items = mapper.readTree(response)
                    .path("response").path("body").path("items").path("item");

            List<AirportDTO> airportDTOList = new ArrayList<>();
            if (items.isArray()) {
                for (JsonNode it : items) {
                    airportDTOList.add(AirportDTO.builder()
                            .airportId(it.path("airportId").asText())
                            .airportNm(it.path("airportNm").asText())
                            .build());
                }
            }

            return airportDTOList;
        } catch (Exception e) {
            throw new RuntimeException("[AirportService] 공항 데이터 API 호출 실패", e);
        }
    }

    @Override
    public void saveAirport(Airport airport) {
        airportRepository.save(airport);
    }

    @Override
    public Airport getAirportById(String airportId) {
        return airportRepository.findById(airportId) // 👈 여기서 NAARK...를 찾고 있습니다.
                .orElseThrow(() -> new RuntimeException("공항 정보 없음: " + airportId));
    }
}
