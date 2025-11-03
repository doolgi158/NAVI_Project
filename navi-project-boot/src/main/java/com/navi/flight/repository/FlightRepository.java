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

    /**
     * ✅ 기존 ±시간 범위 검색 (남겨둠)
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

    /**
     * ✅ 날짜 단위 비교 (Oracle TRUNC)
     * - depTime의 '날짜'만 일치하면 조회
     * - 자동 좌석 생성 로직에서 사용
     */
    @Query("""
            SELECT f
              FROM Flight f
             WHERE f.flightId.flightId = :flightId
               AND CAST(f.flightId.depTime AS date) = CAST(:depDate AS date)
            """)
    Optional<Flight> findByFlightIdAndDepDate(
            @Param("flightId") String flightId,
            @Param("depDate") LocalDateTime depDate
    );


    /**
     * 항공편 코드별 전체 조회 (예: LJ123)
     */
    @Query("""
            SELECT f 
              FROM Flight f
             WHERE f.flightId.flightId = :flightId
             ORDER BY f.flightId.depTime ASC
            """)
    List<Flight> findAllByFlightId(@Param("flightId") String flightId);

    boolean existsByFlightId_FlightIdAndFlightId_DepTime(String flightId, LocalDateTime depTime);
}
