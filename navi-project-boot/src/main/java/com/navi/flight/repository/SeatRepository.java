package com.navi.flight.repository;

import com.navi.flight.domain.FlightId;
import com.navi.flight.domain.Seat;
import com.navi.flight.dto.SeatStatusDTO;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/*
 *  SeatRepository
 * - 좌석 동시성 제어
 * - 항공편별 좌석 현황 통계
 */
public interface SeatRepository extends JpaRepository<Seat, Long> {

    /* 예약 시 동시성 제어용 (좌석 하나를 쓰기 락) */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Seat s where s.seatId = :seatId")
    Optional<Seat> findByIdForUpdate(@Param("seatId") Long seatId);

    /* 항공편(복합키) 기준으로 좌석이 이미 존재하는지 */
    @Query("select (count(s) > 0) from Seat s where s.flight.id = :flightId")
    boolean existsByFlightId(@Param("flightId") FlightId flightId);

    /* 전체 항공편별 좌석 현황 통계 (총석, 잔여석, 등급별) */
    @Query("""
        SELECT new com.navi.flight.dto.SeatStatusDTO(
            s.flight.id.flightId,
            s.flight.airlineNm,
            COUNT(s),
            SUM(CASE WHEN s.isReserved = false THEN 1 ELSE 0 END),
            SUM(CASE WHEN s.seatClass = 'ECONOMY' THEN 1 ELSE 0 END),
            SUM(CASE WHEN s.seatClass = 'ECONOMY' AND s.isReserved = false THEN 1 ELSE 0 END),
            SUM(CASE WHEN s.seatClass = 'PRESTIGE' THEN 1 ELSE 0 END),
            SUM(CASE WHEN s.seatClass = 'PRESTIGE' AND s.isReserved = false THEN 1 ELSE 0 END)
        )
        FROM Seat s
        GROUP BY s.flight.id.flightId, s.flight.airlineNm
        ORDER BY s.flight.id.flightId
    """)
    List<SeatStatusDTO> findSeatStatusByFlight();

    /* 특정 항공편 하나의 좌석 현황 통계 (flightId 기준) */
    @Query("""
        SELECT new com.navi.flight.dto.SeatStatusDTO(
            s.flight.id.flightId,
            s.flight.airlineNm,
            COUNT(s),
            SUM(CASE WHEN s.isReserved = false THEN 1 ELSE 0 END),
            SUM(CASE WHEN s.seatClass = 'ECONOMY' THEN 1 ELSE 0 END),
            SUM(CASE WHEN s.seatClass = 'ECONOMY' AND s.isReserved = false THEN 1 ELSE 0 END),
            SUM(CASE WHEN s.seatClass = 'PRESTIGE' THEN 1 ELSE 0 END),
            SUM(CASE WHEN s.seatClass = 'PRESTIGE' AND s.isReserved = false THEN 1 ELSE 0 END)
        )
        FROM Seat s
        WHERE s.flight.id.flightId = :flightId
        GROUP BY s.flight.id.flightId, s.flight.airlineNm
    """)
    Optional<SeatStatusDTO> findSeatStatusByFlightId(@Param("flightId") String flightId);
}
