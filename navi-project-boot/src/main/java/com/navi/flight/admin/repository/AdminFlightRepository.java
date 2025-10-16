package com.navi.flight.admin.repository;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminFlightRepository extends JpaRepository<Flight, FlightId> {
}
