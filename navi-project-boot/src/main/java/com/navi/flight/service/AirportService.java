package com.navi.flight.service;

import com.navi.flight.domain.Airport;
import com.navi.flight.dto.AirportDTO;

import java.util.List;

public interface AirportService {

    void loadAirportData();

    long countAirports();

    String getAirportIdByName(String airportName);

    Airport getAirportByCode(String airportCode);

    /**
     * DB에 저장된 전체 공항 조회
     */
    List<Airport> getAllAirports();

    List<AirportDTO> fetchAirportDataFromApi(); // API 호출 후 DTO 반환

    void saveAirport(Airport airport); // 단일 Airport 저장

    Airport getAirportById(String depAirportCode);
}
