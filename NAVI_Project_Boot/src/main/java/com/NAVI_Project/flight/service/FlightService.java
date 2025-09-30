package com.NAVI_Project.flight.service;

import com.NAVI_Project.flight.domain.Flight;

public interface FlightService {
    public void saveFlight(Flight flight);
    public void reserveSeat(Long seatId, String userName);
}
