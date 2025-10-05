package com.navi.flight.repository;

import com.navi.flight.domain.Seat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * 좌석 Repository
 * - 기본 CRUD + 동시성 제어
 */
public interface SeatRepository extends JpaRepository<Seat, Long> {

    /**
     * 좌석 예약 시 동시성 문제를 막기 위해
     * 특정 좌석을 비관적 락(PESSIMISTIC_WRITE)으로 조회
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Seat s where s.seatId = :seatId")
    Optional<Seat> findByIdForUpdate(@Param("seatId") Long seatId);
}
