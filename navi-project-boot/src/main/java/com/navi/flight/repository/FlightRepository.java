package com.navi.flight.repository;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface FlightRepository extends JpaRepository<Flight, FlightId> {

    /*
     * flightId + depTime 기반 항공편 조회 (1초 오차 허용)
     * - LocalDateTime의 초·밀리초 차이로 조회 실패 방지
     */
    @Query("""
        SELECT f 
        FROM Flight f 
        WHERE f.flightId.flightId = :flightId
          AND f.flightId.depTime BETWEEN :startTime AND :endTime
        """)
    Optional<Flight> findByFlightIdAndDepTimeRange(
            @Param("flightId") String flightId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}
