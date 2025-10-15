package com.navi.flight.repository;

import com.navi.flight.domain.FlightReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface FlightReservationRepository extends JpaRepository<FlightReservation, String> {

    /* 사용자별 예약 목록 조회 */
    List<FlightReservation> findByUser_No(Long userNo);

    /* 오늘 날짜 기준 예약 건수 카운트 (예약번호 시퀀스용) */
    @Query("""
        SELECT COUNT(f)
        FROM FlightReservation f
        WHERE f.createdAt BETWEEN :start AND :end
    """)
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
