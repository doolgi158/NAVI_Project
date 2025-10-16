package com.navi.flight.service;

import com.navi.flight.domain.Airport;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import com.navi.flight.dto.ApiFlightDTO;
import com.navi.flight.dto.FlightDetailResponseDTO;
import com.navi.flight.dto.FlightSearchRequestDTO;
import com.navi.flight.repository.AirportRepository;
import com.navi.flight.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/*
 * FlightServiceImpl
 * - 항공편 저장 및 조회 담당
 * - 좌석 생성은 SeatService에서 지연 처리
 */
@Service
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService {

    private final FlightRepository flightRepository;
    private final AirportRepository airportRepository;

    /*
     * API 공항명 → DB 공항 엔티티 매핑
     */
    private Airport resolveAirportByApiName(String apiName) {
        if ("부산".equals(apiName) || "김해".equals(apiName)) {
            return airportRepository.findByAirportName("김해(부산)")
                    .orElseThrow(() -> new RuntimeException("공항 정보 없음: " + apiName));
        }
        return airportRepository.findByAirportName(apiName)
                .or(() -> airportRepository.findByAirportNameContaining(apiName))
                .orElseThrow(() -> new RuntimeException("공항 정보 없음: " + apiName));
    }

    /*
     * 항공편 저장 (좌석은 생성하지 않음)
     */
    @Override
    public void saveFlight(ApiFlightDTO dto) {
        Airport depAirport = resolveAirportByApiName(dto.getDepAirportNm());
        Airport arrAirport = resolveAirportByApiName(dto.getArrAirportNm());

        // 2025.10 구조 기준: @EmbeddedId 필드명이 flightId
        Flight flight = Flight.builder()
                .flightId(new FlightId(
                        dto.getVihicleId(),
                        LocalDateTime.parse(dto.getDepPlandTime().toString(),
                                DateTimeFormatter.ofPattern("yyyyMMddHHmm"))
                ))
                .airlineNm(dto.getAirlineNm())
                .depAirport(depAirport)
                .arrAirport(arrAirport)
                .arrTime(LocalDateTime.parse(dto.getArrPlandTime().toString(),
                        DateTimeFormatter.ofPattern("yyyyMMddHHmm")))
                .economyCharge(dto.getEconomyCharge())
                .prestigeCharge(dto.getPrestigeCharge())
                .seatInitialized(false)
                .build();

        flightRepository.save(flight);
    }

    /*
     * 항공편 조회
     */
    @Override
    public List<FlightDetailResponseDTO> searchFlights(FlightSearchRequestDTO requestDTO) {

        System.out.println("검색 요청 DTO = " + requestDTO);

        return flightRepository.findAll().stream()
                // 출발 공항 코드 일치
                .filter(f -> f.getDepAirport().getAirportCode()
                        .equals(requestDTO.getDepAirportCode()))
                // 도착 공항 코드 일치
                .filter(f -> f.getArrAirport().getAirportCode()
                        .equals(requestDTO.getArrAirportCode()))
                // 출발 날짜 일치 (LocalDate 비교)
                .filter(f -> f.getFlightId().getDepTime().toLocalDate()
                        .equals(LocalDate.parse(requestDTO.getDepDate())))
                // DTO 변환
                .map(f -> {
                    int price = requestDTO.getSeatClass().equalsIgnoreCase("ECONOMY")
                            ? f.getEconomyCharge()
                            : (f.getPrestigeCharge() != null ? f.getPrestigeCharge() : 0);

                    return FlightDetailResponseDTO.builder()
                            .flightNo(f.getFlightId().getFlightId())
                            .airlineNm(f.getAirlineNm())
                            .depAirportCode(f.getDepAirport().getAirportCode())
                            .depAirportName(f.getDepAirport().getAirportName())
                            .arrAirportCode(f.getArrAirport().getAirportCode())
                            .arrAirportName(f.getArrAirport().getAirportName())
                            .depTime(f.getFlightId().getDepTime())
                            .arrTime(f.getArrTime())
                            .price(price)
                            .seatClass(requestDTO.getSeatClass().toUpperCase())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public long countFlights() {
        return flightRepository.count();
    }
}
