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

    /* ✅ 오차 허용 범위 내 좌석 수 카운트 (boolean 대신 long 사용) */
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

    /* ✅ 오차 허용 범위로 좌석 조회 */
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

    /* ✅ 관리자 검색용 (필터 + 페이징) */
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

    /* ✅ 관리용 (날짜 단위) */
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

}
