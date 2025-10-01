package com.navi.flight.repository;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FlightRepository extends JpaRepository<Flight, FlightId> {
}
