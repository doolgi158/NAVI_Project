package com.navi.flight.admin.service;

import com.navi.flight.admin.dto.AdminAirportDTO;
import com.navi.flight.domain.Airport;
import com.navi.flight.repository.AirportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAirportServiceImpl implements AdminAirportService {

    private final AirportRepository airportRepository;

    @Override
    public List<Airport> findAll() {
        return airportRepository.findAll();
    }

    @Override
    public Airport createAirport(AdminAirportDTO dto) {
        Airport airport = Airport.builder()
                .airportCode(dto.getAirportCode())
                .airportName(dto.getAirportName())
                .build();
        return airportRepository.save(airport);
    }

    @Override
    public Airport updateAirport(String code, AdminAirportDTO dto) {
        Airport existing = airportRepository.findById(code)
                .orElseThrow(() -> new IllegalArgumentException("공항을 찾을 수 없습니다: " + code));

        existing.setAirportName(dto.getAirportName());
        return airportRepository.save(existing);
    }

    @Override
    public void deleteAirport(String code) {
        airportRepository.deleteById(code);
    }
}
