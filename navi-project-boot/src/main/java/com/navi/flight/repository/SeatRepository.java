package com.navi.flight.repository;

import com.navi.flight.domain.FlightId;
import com.navi.flight.domain.Seat;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.seatId = :seatId")
    Seat findByIdForUpdate(@Param("seatId") Long seatId);

    // ✅ Flight FK 경로도 flight.flightId 로 수정
    @Query("SELECT (COUNT(s) > 0) FROM Seat s WHERE s.flight.flightId = :flightId")
    boolean existsByFlightId(@Param("flightId") FlightId flightId);

    @Query("""
        SELECT s
        FROM Seat s
        WHERE s.flight.flightId.flightId = :flightId
          AND s.flight.flightId.depTime  = :depTime
        ORDER BY s.seatNo ASC
        """)
    List<Seat> findByFlightAndDepTime(
            @Param("flightId") String flightId,
            @Param("depTime") LocalDateTime depTime
    );

    @Query("""
        SELECT s
        FROM Seat s
        WHERE s.flight.flightId.flightId = :flightId
          AND s.flight.flightId.depTime  = :depTime
          AND s.isReserved = false
        ORDER BY s.seatNo ASC
        """)
    List<Seat> findAvailableSeatsOrdered(
            @Param("flightId") String flightId,
            @Param("depTime") LocalDateTime depTime
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT s
        FROM Seat s
        WHERE s.flight.flightId.flightId = :flightId
          AND s.flight.flightId.depTime  = :depTime
          AND s.isReserved = false
        ORDER BY s.seatNo ASC
        """)
    List<Seat> pickOneAvailableSeatForUpdate(
            @Param("flightId") String flightId,
            @Param("depTime") LocalDateTime depTime,
            Pageable pageable
    );
}
