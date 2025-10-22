package com.navi.flight.repository;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.Seat;
import com.navi.flight.domain.SeatClass;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.seatId = :seatId")
    Seat findByIdForUpdate(@Param("seatId") Long seatId);

    @Query("""
        SELECT COUNT(s.seatId)
          FROM Seat s
         WHERE s.flight.flightId.flightId = :flightId
           AND s.flight.flightId.depTime BETWEEN :start AND :end
        """)
    long countByFlightIdAndDepTimeRange(
            @Param("flightId") String flightId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
        SELECT s
          FROM Seat s
         WHERE s.flight.flightId.flightId = :flightId
           AND s.flight.flightId.depTime BETWEEN :start AND :end
         ORDER BY s.seatNo ASC
        """)
    List<Seat> findByFlightAndDepTimeRange(
            @Param("flightId") String flightId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
        SELECT s
          FROM Seat s
         WHERE (:flightId IS NULL OR s.flight.flightId.flightId = :flightId)
           AND (:depTime IS NULL OR s.flight.flightId.depTime = :depTime)
           AND (:reserved IS NULL OR s.isReserved = :reserved)
           AND (:seatClass IS NULL OR s.seatClass = :seatClass)
           AND (
                :q IS NULL
             OR LOWER(s.seatNo) LIKE LOWER(CONCAT('%', :q, '%'))
             OR LOWER(s.flight.flightId.flightId) LIKE LOWER(CONCAT('%', :q, '%'))
           )
         ORDER BY s.flight.flightId.flightId ASC, s.flight.flightId.depTime ASC, s.seatNo ASC
        """)
    Page<Seat> searchAdminSeats(@Param("flightId") String flightId,
                                @Param("depTime") LocalDateTime depTime,
                                @Param("reserved") Boolean reserved,
                                @Param("seatClass") SeatClass seatClass,
                                @Param("q") String q,
                                Pageable pageable);

    @Query("""
        SELECT s
          FROM Seat s
         WHERE s.flight.flightId.flightId = :flightId
           AND CAST(s.flight.flightId.depTime AS date) = CAST(:depTime AS date)
         ORDER BY s.seatNo ASC
        """)
    Page<Seat> findByFlight(@Param("flightId") String flightId,
                            @Param("depTime") LocalDateTime depTime,
                            Pageable pageable);

    void deleteByFlight(Flight flight);

    @Query("""
    SELECT s
      FROM Seat s
     WHERE s.flight.flightId.flightId = :flightId
       AND s.flight.flightId.depTime  = :depTime
     ORDER BY s.seatNo ASC
    """)
    List<Seat> findByFlightAndDepTime(@Param("flightId") String flightId,
                                      @Param("depTime") LocalDateTime depTime);

    // ✅ 추가: 자동배정용 (해당 항공편의 예약되지 않은 좌석 전체)
    @Query("""
        SELECT s
          FROM Seat s
         WHERE s.flight = :flight
           AND s.isReserved = false
         ORDER BY s.seatNo ASC
        """)
    List<Seat> findAvailableSeatsByFlight(@Param("flight") Flight flight);

    List<Seat> findByFlight_FlightId_FlightIdAndFlight_FlightId_DepTimeAndIsReservedFalse(
            String flightId,
            LocalDateTime depTime
    );

}
