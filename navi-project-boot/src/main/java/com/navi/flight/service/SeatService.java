package com.navi.flight.service;

import com.navi.flight.domain.Flight;
import com.navi.flight.dto.SeatStatusDTO;

import java.util.List;

public interface SeatService {

    void createSeatsIfNotExists(Flight flight);

    List<SeatStatusDTO> getSeatStatusByFlight();          // 전체 항공편 좌석 현황
    SeatStatusDTO getSeatStatusByFlightId(String flightId); // 특정 항공편 좌석 현황
}

