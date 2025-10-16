package com.navi.flight.repository;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FlightRepository extends JpaRepository<Flight, FlightId> {

    /*
     * 항공편 ID와 출발시간 범위로 항공편 조회
     * - Flight.flightId.flightId
     * - Flight.flightId.depTime
     * - SeatServiceImpl과 FlightReservationServiceImpl이 공용으로 사용하는 메서드
     */

    @Query("""
        SELECT f
        FROM Flight f
        WHERE f.flightId.flightId = :flightId
          AND f.flightId.depTime BETWEEN :start AND :end
        """)
    Optional<Flight> findByFlightIdAndDepTimeRange(
            @Param("flightId") String flightId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    /*
     * 항공편 코드로 전체 조회 (예: LJ123)
     */
    @Query("""
        SELECT f 
        FROM Flight f
        WHERE f.flightId.flightId = :flightId
        ORDER BY f.flightId.depTime ASC
        """)
    List<Flight> findAllByFlightId(@Param("flightId") String flightId);
}
