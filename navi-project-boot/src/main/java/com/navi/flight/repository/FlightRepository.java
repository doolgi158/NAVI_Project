package com.navi.flight.repository;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 항공편 Repository
 * - 복합키 FlightId 기반
 */
public interface FlightRepository extends JpaRepository<Flight, FlightId> {
}
