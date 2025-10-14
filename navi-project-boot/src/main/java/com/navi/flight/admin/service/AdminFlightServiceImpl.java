package com.navi.flight.admin.service;

import com.navi.flight.admin.dto.AdminFlightDTO;
import com.navi.flight.admin.repository.AdminFlightRepository;
import com.navi.flight.domain.Airport;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import com.navi.flight.repository.AirportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminFlightServiceImpl implements AdminFlightService {

    private final AdminFlightRepository adminFlightRepository;
    private final AirportRepository airportRepository;

    @Override
    public List<AdminFlightDTO> getAllFlights() {
        return adminFlightRepository.findAll().stream()
                .map(AdminFlightDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public AdminFlightDTO getFlight(String flightId, LocalDateTime depTime) {
        FlightId id = new FlightId(flightId, depTime);
        Flight flight = adminFlightRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 항공편이 존재하지 않습니다."));
        return AdminFlightDTO.fromEntity(flight);
    }

    @Override
    public AdminFlightDTO createFlight(AdminFlightDTO dto) {
        Airport depAirport = airportRepository.findByAirportName(dto.getDepAirportNm())
                .orElseThrow(() -> new IllegalArgumentException("출발 공항명을 찾을 수 없습니다: " + dto.getDepAirportNm()));
        Airport arrAirport = airportRepository.findByAirportName(dto.getArrAirportNm())
                .orElseThrow(() -> new IllegalArgumentException("도착 공항명을 찾을 수 없습니다: " + dto.getArrAirportNm()));

        Flight flight = Flight.builder()
                .flightId(new FlightId(dto.getFlightId(), dto.getDepTime()))
                .airlineNm(dto.getAirlineNm())
                .depAirport(depAirport)
                .arrAirport(arrAirport)
                .arrTime(dto.getArrTime())
                .economyCharge(dto.getEconomyCharge())
                .prestigeCharge(dto.getPrestigeCharge())
                .seatInitialized(dto.isSeatInitialized())
                .build();

        adminFlightRepository.save(flight);
        return AdminFlightDTO.fromEntity(flight);
    }

    @Override
    public AdminFlightDTO updateFlight(String flightId, LocalDateTime depTime, AdminFlightDTO dto) {
        FlightId id = new FlightId(flightId, depTime);
        Flight existing = adminFlightRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("수정할 항공편이 존재하지 않습니다."));

        Airport depAirport = airportRepository.findByAirportName(dto.getDepAirportNm())
                .orElseThrow(() -> new IllegalArgumentException("출발 공항명을 찾을 수 없습니다: " + dto.getDepAirportNm()));
        Airport arrAirport = airportRepository.findByAirportName(dto.getArrAirportNm())
                .orElseThrow(() -> new IllegalArgumentException("도착 공항명을 찾을 수 없습니다: " + dto.getArrAirportNm()));

        existing.setAirlineNm(dto.getAirlineNm());
        existing.setDepAirport(depAirport);
        existing.setArrAirport(arrAirport);
        existing.setArrTime(dto.getArrTime());
        existing.setEconomyCharge(dto.getEconomyCharge());
        existing.setPrestigeCharge(dto.getPrestigeCharge());

        adminFlightRepository.save(existing);
        return AdminFlightDTO.fromEntity(existing);
    }

    @Override
    public void deleteFlight(String flightId, LocalDateTime depTime) {
        FlightId id = new FlightId(flightId, depTime);
        adminFlightRepository.deleteById(id);
    }
}
