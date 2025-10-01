package com.navi.flight.service;

import com.navi.flight.domain.Flight;

public interface FlightService {
    public void saveFlight(Flight flight);
    public void reserveSeat(Long seatId, String userName);
}
