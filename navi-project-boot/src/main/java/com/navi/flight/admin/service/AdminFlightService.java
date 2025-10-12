package com.navi.flight.admin.service;

import com.navi.flight.admin.dto.AdminFlightDTO;
import java.time.LocalDateTime;
import java.util.List;

public interface AdminFlightService {
    List<AdminFlightDTO> getAllFlights();
    AdminFlightDTO getFlight(String flightId, LocalDateTime depTime);
    AdminFlightDTO createFlight(AdminFlightDTO dto);
    AdminFlightDTO updateFlight(String flightId, LocalDateTime depTime, AdminFlightDTO dto);
    void deleteFlight(String flightId, LocalDateTime depTime);
}
