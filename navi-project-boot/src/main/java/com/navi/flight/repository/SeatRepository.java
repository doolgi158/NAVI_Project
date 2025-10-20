package com.navi.flight.repository;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
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

    /* =========================
     * 기본 조회 + 락 (기존)
     * ========================= */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.seatId = :seatId")
    Seat findByIdForUpdate(@Param("seatId") Long seatId);

    /* =========================
     * 좌석 존재 여부 (기존)
     *  - SeatServiceImpl.ensureSeatsInitialized()에서 사용
     * ========================= */
    @Query("""
            SELECT (COUNT(s) > 0)
              FROM Seat s
             WHERE s.flight.flightId = :flightId
            """)
    boolean existsByFlightId(@Param("flightId") FlightId flightId);

    /* =========================
     * 항공편 기준 좌석 조회 (기존)
     *  - SeatServiceImpl.getSeatsByFlight()에서 사용
     * ========================= */
    @Query("""
            SELECT s
              FROM Seat s
             WHERE s.flight.flightId.flightId = :flightId
               AND s.flight.flightId.depTime  = :depTime
             ORDER BY s.seatNo ASC
            """)
    List<Seat> findByFlightAndDepTime(@Param("flightId") String flightId,
                                      @Param("depTime") LocalDateTime depTime);

    /* =========================
     * 예약 가능 좌석 조회 (기존)
     *  - SeatServiceImpl.autoAssignSeats()에서 사용
     * ========================= */
    @Query("""
            SELECT s
              FROM Seat s
             WHERE s.flight.flightId.flightId = :flightId
               AND s.flight.flightId.depTime  = :depTime
               AND s.isReserved = false
             ORDER BY s.seatNo ASC
            """)
    List<Seat> findAvailableSeatsOrdered(@Param("flightId") String flightId,
                                         @Param("depTime") LocalDateTime depTime);

    /* =========================
     * (관리자) 항공편별 좌석 조회 - 페이징
     *  - AdminSeatServiceImpl.getSeatsByFlight(..., Pageable)에서 사용
     * ========================= */
    @Query("""
            SELECT s
              FROM Seat s
             WHERE s.flight.flightId.flightId = :flightId
               AND s.flight.flightId.depTime  = :depTime
             ORDER BY s.seatNo ASC
            """)
    Page<Seat> findByFlight(@Param("flightId") String flightId,
                            @Param("depTime") LocalDateTime depTime,
                            Pageable pageable);

    /* =========================
     * (관리자) 조건 검색 - 페이징
     *  - AdminSeatServiceImpl.searchAll()에서 사용
     * ========================= */
    @Query("""
            SELECT s
              FROM Seat s
             WHERE (:flightId IS NULL OR s.flight.flightId.flightId = :flightId)
               AND (:depTime  IS NULL OR s.flight.flightId.depTime  = :depTime)
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

    /* =========================
     * (관리자) 항공편 기준 일괄 삭제 - 초기화용
     *  - AdminSeatServiceImpl.resetSeats()/deleteSeats()에서 사용
     * ========================= */
    void deleteByFlight(Flight flight);
}
