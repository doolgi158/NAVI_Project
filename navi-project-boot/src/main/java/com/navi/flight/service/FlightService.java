package com.navi.flight.service;

import com.navi.flight.domain.Flight;
import com.navi.flight.dto.FlightDetailResponseDTO;
import com.navi.flight.dto.FlightSearchRequestDTO;

import java.util.List;

public interface FlightService {
    public void saveFlight(Flight flight);
    public void reserveSeat(Long seatId, String userName);

    List<FlightDetailResponseDTO> searchFlights(FlightSearchRequestDTO requestDTO);
}
