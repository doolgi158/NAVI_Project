package com.navi.flight.repository;

import com.navi.flight.domain.FlightReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FlightReservationRepository extends JpaRepository<FlightReservation, String> {

    /** 사용자별 예약 목록 조회 */
    List<FlightReservation> findByUser_No(Long userNo);

    /** 항공편별 예약 조회 (복합키 접근) */
    List<FlightReservation> findByFlight_FlightId_FlightIdAndFlight_FlightId_DepTimeBetween(
            String flightId,
            LocalDateTime start,
            LocalDateTime end
    );

    /** 단일 예약 조회 */
    Optional<FlightReservation> findByFrsvId(String frsvId);
}
