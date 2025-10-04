package com.navi.flight.service;

import com.navi.flight.dto.ApiFlightDTO;
import com.navi.flight.dto.FlightDetailResponseDTO;
import com.navi.flight.dto.FlightSearchRequestDTO;

import java.util.List;

public interface FlightService {
    void saveFlight(ApiFlightDTO dto);          // 항공편 저장 + 좌석 생성
    void reserveSeat(Long seatId, String userName); // 좌석 예약
    List<FlightDetailResponseDTO> searchFlights(FlightSearchRequestDTO requestDTO); // 항공편 검색
    long countFlights();                        // ✅ 항공편 개수
    long countSeats();                          // ✅ 좌석 개수
}
