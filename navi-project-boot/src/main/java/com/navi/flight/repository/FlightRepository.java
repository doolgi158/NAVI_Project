package com.navi.flight.repository;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface FlightRepository extends JpaRepository<Flight, FlightId> {

    /**
     * ✅ flightId + depTime 기반 항공편 조회
     *  EmbeddedId 필드명이 flightId 이므로 f.flightId.flightId / f.flightId.depTime 으로 접근
     */
    @Query("""
        SELECT f 
        FROM Flight f 
        WHERE f.flightId.flightId = :flightId 
          AND f.flightId.depTime  = :depTime
        """)
    Optional<Flight> findByFlightIdAndDepTime(
            @Param("flightId") String flightId,
            @Param("depTime") LocalDateTime depTime
    );
}
