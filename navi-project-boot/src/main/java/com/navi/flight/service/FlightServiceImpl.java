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

/**
 * ✈️ FlightServiceImpl
 * - 항공편 저장 및 조회 담당
 * - 좌석 생성은 SeatService에서 지연 처리
 */
@Service
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService {

    private final FlightRepository flightRepository;
    private final AirportRepository airportRepository;

    /**
     * ✅ API 공항명 → DB 공항 엔티티 매핑
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

    /**
     * ✅ 항공편 저장 (좌석은 생성하지 않음)
     */
    @Override
    public void saveFlight(ApiFlightDTO dto) {
        Airport depAirport = resolveAirportByApiName(dto.getDepAirportNm());
        Airport arrAirport = resolveAirportByApiName(dto.getArrAirportNm());

        Flight flight = Flight.builder()
                .id(new FlightId(
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

    /**
     * ✅ 항공편 조회
     * - 클라이언트에서 보낸 검색 조건에 맞는 항공편을 필터링
     * - 공항코드 + 출발일 기준으로 검색
     */
    @Override
    public List<FlightDetailResponseDTO> searchFlights(FlightSearchRequestDTO requestDTO) {

        // 1️⃣ 출발·도착 공항 코드
        String depCode = requestDTO.getDepAirportCode();
        String arrCode = requestDTO.getArrAirportCode();

        // 2️⃣ 출발일 하루 범위 (00:00~23:59)
        LocalDate depDate = LocalDate.parse(requestDTO.getDepDate());
        LocalDateTime start = depDate.atStartOfDay();
        LocalDateTime end = depDate.atTime(23, 59, 59);

        // 3️⃣ Repository 호출
        List<Flight> flights = flightRepository.findFlightsByCondition(depCode, arrCode, start, end);

        // 4️⃣ DTO 변환
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        return flights.stream()
                .map(f -> {
                    int price = requestDTO.getSeatClass().equalsIgnoreCase("ECONOMY")
                            ? f.getEconomyCharge()
                            : (f.getPrestigeCharge() != null ? f.getPrestigeCharge() : f.getEconomyCharge());

                    return FlightDetailResponseDTO.builder()
                            .flightNo(f.getId().getFlightId())
                            .airlineNm(f.getAirlineNm())
                            .depAirportCode(f.getDepAirport().getAirportCode())
                            .depAirportName(f.getDepAirport().getAirportName())
                            .arrAirportCode(f.getArrAirport().getAirportCode())
                            .arrAirportName(f.getArrAirport().getAirportName())
                            .depTime(LocalDateTime.from(f.getId().getDepTime()))
                            .arrTime(f.getArrTime())
                            .price(price)
                            .seatClass(requestDTO.getSeatClass().toUpperCase())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * ✅ 전체 항공편 개수 조회
     */
    @Override
    public long countFlights() {
        return flightRepository.count();
    }
}
