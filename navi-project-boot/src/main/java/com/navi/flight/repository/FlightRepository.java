package com.navi.flight.repository;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/*
 *  FlightRepository
 * - 복합키 FlightId 기반
 */
@Repository
public interface FlightRepository extends JpaRepository<Flight, FlightId> {
}
