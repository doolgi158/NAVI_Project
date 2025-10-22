package com.navi.flight.admin.service;

import com.navi.flight.admin.dto.AdminFlightDTO;
import com.navi.flight.domain.Airport;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import com.navi.flight.repository.AirportRepository;
import com.navi.flight.repository.FlightRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminFlightServiceImpl implements AdminFlightService {

    private final FlightRepository flightRepository;
    private final AirportRepository airportRepository;

    /*
     * 전체 조회
     */
    @Override
    public List<AdminFlightDTO> getAllFlights() {
        log.info("[ADMIN] 전체 항공편 조회 실행");
        return flightRepository.findAll()
                .stream()
                .map(AdminFlightDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /*
     * 단건 조회
     */
    @Override
    public AdminFlightDTO getFlight(String flightId, LocalDateTime depTime) {
        FlightId id = new FlightId(flightId, depTime);
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("항공편을 찾을 수 없습니다."));
        return AdminFlightDTO.fromEntity(flight);
    }

    /*
     * 등록
     */
    @Override
    @Transactional
    public AdminFlightDTO createFlight(AdminFlightDTO dto) {
        log.info("[ADMIN] 항공편 등록 요청: {}", dto.getFlightId());

        Airport depAirport = airportRepository.findByAirportName(dto.getDepAirportNm())
                .orElseThrow(() -> new IllegalArgumentException("출발공항을 찾을 수 없습니다."));
        Airport arrAirport = airportRepository.findByAirportName(dto.getArrAirportNm())
                .orElseThrow(() -> new IllegalArgumentException("도착공항을 찾을 수 없습니다."));

        Flight flight = Flight.builder()
                .flightId(new FlightId(dto.getFlightId(), dto.getDepTime()))
                .airlineNm(dto.getAirlineNm())
                .depAirport(depAirport)
                .arrAirport(arrAirport)
                .arrTime(dto.getArrTime())
                .economyCharge(dto.getEconomyCharge())
                .prestigeCharge(dto.getPrestigeCharge())
                .seatInitialized(false)
                .build();

        Flight saved = flightRepository.save(flight);
        return AdminFlightDTO.fromEntity(saved);
    }

    /*
     * 수정
     */
    @Override
    @Transactional
    public AdminFlightDTO updateFlight(String flightId, LocalDateTime depTime, AdminFlightDTO dto) {
        FlightId id = new FlightId(flightId, depTime);
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("항공편을 찾을 수 없습니다."));

        Airport depAirport = airportRepository.findByAirportName(dto.getDepAirportNm())
                .orElseThrow(() -> new IllegalArgumentException("출발공항을 찾을 수 없습니다."));
        Airport arrAirport = airportRepository.findByAirportName(dto.getArrAirportNm())
                .orElseThrow(() -> new IllegalArgumentException("도착공항을 찾을 수 없습니다."));

        flight.setAirlineNm(dto.getAirlineNm());
        flight.setDepAirport(depAirport);
        flight.setArrAirport(arrAirport);
        flight.setArrTime(dto.getArrTime());
        flight.setEconomyCharge(dto.getEconomyCharge());
        flight.setPrestigeCharge(dto.getPrestigeCharge());

        Flight updated = flightRepository.save(flight);
        return AdminFlightDTO.fromEntity(updated);
    }

    /*
     * 삭제
     */
    @Override
    @Transactional
    public void deleteFlight(String flightId, LocalDateTime depTime) {
        FlightId id = new FlightId(flightId, depTime);
        if (!flightRepository.existsById(id)) {
            throw new IllegalArgumentException("삭제할 항공편을 찾을 수 없습니다.");
        }
        flightRepository.deleteById(id);
        log.info("[ADMIN] 항공편 삭제 완료: {} / {}", flightId, depTime);
    }
}
