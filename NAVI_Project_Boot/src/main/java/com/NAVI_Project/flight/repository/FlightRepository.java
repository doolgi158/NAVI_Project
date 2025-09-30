package com.NAVI_Project.flight.repository;

import com.NAVI_Project.flight.domain.Flight;
import com.NAVI_Project.flight.domain.FlightId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlightRepository extends JpaRepository<Flight, FlightId> {
}
