package com.navi.flight.repository;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ✈️ FlightRepository
 * - 항공편 기본 CRUD
 * - 출발/도착 공항 및 날짜로 항공편 조회
 */
@Repository
public interface FlightRepository extends JpaRepository<Flight, FlightId> {

    /**
     * ✅ 공항 코드와 출발일 기준으로 항공편 조회
     * - 복합키(FlightId) 내부 depTime 필드 기준으로 범위 검색
     */
    @Query("""
        SELECT f
        FROM Flight f
        WHERE f.depAirport.airportCode = :depAirportCode
          AND f.arrAirport.airportCode = :arrAirportCode
          AND f.id.depTime BETWEEN :start AND :end
    """)
    List<Flight> findFlightsByCondition(
            @Param("depAirportCode") String depAirportCode,
            @Param("arrAirportCode") String arrAirportCode,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
