package com.NAVI_Project.flight.repository;

import com.NAVI_Project.flight.entity.Flight;
import com.NAVI_Project.flight.entity.FlightId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlightRepository extends JpaRepository<Flight, FlightId> {
}
