package com.navi.flight.service;

import com.navi.flight.domain.Seat;
import com.navi.flight.dto.SeatResponseDTO;
import java.time.LocalDateTime;
import java.util.List;

public interface SeatService {
    List<SeatResponseDTO> getSeatsByFlight(String flightId, LocalDateTime depTime);
    List<Seat> autoAssignSeats(String flightId, LocalDateTime depTime, int passengerCount);
    boolean ensureSeatsInitialized(String flightId, LocalDateTime depTime);
}

