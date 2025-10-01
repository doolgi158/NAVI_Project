package com.navi.flight.repository;

import com.navi.flight.entity.Flight;
import com.navi.flight.entity.FlightId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlightRepository extends JpaRepository<Flight, FlightId> {
}
