package com.navi.flight.service;

import com.navi.flight.dto.ApiFlightDTO;
import com.navi.flight.dto.FlightDetailResponseDTO;
import com.navi.flight.dto.FlightSearchRequestDTO;

import java.util.List;

/*
 *  FlightService
 *
 * [책임]
 * - 항공편 등록
 * - 항공편 조회
 * - 항공편 개수 조회
 */
public interface FlightService {

    /* 항공편 등록 (좌석은 생성하지 않음) */
    void saveFlight(ApiFlightDTO dto);

    /* 항공편 검색 (출발/도착/날짜/좌석등급 기준) */
    List<FlightDetailResponseDTO> searchFlights(FlightSearchRequestDTO requestDTO);

    /* 등록된 항공편 개수 조회 */
    long countFlights();
}
