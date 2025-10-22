package com.navi.flight.repository;

import com.navi.common.enums.RsvStatus;
import com.navi.flight.domain.FlightReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FlightReservationRepository extends JpaRepository<FlightReservation, String> {

    /**
     * 사용자별 예약 목록 조회
     */
    List<FlightReservation> findByUser_No(Long userNo);

    /**
     * 항공편별 예약 조회 (복합키 접근)
     */
    List<FlightReservation> findByFlight_FlightId_FlightIdAndFlight_FlightId_DepTimeBetween(
            String flightId,
            LocalDateTime start,
            LocalDateTime end
    );

    /**
     * 단일 예약 조회
     */
    Optional<FlightReservation> findByFrsvId(String frsvId);

    /**
     * 단일 예약 금액 조회
     */
    @Query("SELECT CAST(f.totalPrice AS bigdecimal) FROM FlightReservation f WHERE f.frsvId = :frsvId")
    BigDecimal getTotalAmountByFrsvId(String frsvId);

    /**
     * 다중 예약 금액 합산 (왕복 전체 금액 계산용)
     */
    @Query("SELECT SUM(CAST(f.totalPrice AS bigdecimal)) FROM FlightReservation f WHERE f.frsvId IN :frsvIds")
    BigDecimal sumTotalAmountByFrsvIds(List<String> frsvIds);

    @Query("""
                SELECT fr
                FROM FlightReservation fr
                LEFT JOIN FETCH fr.user u
                LEFT JOIN FETCH fr.flight f
                LEFT JOIN FETCH fr.seat s
                LEFT JOIN FETCH f.depAirport da
                LEFT JOIN FETCH f.arrAirport aa
            """)
    List<FlightReservation> findAllWithRelations();

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // 관리자 대시보드용 (일정 기간 사이의 예약 상태 기반)
    long countByStatusAndPaidAtBetween(RsvStatus status, LocalDate start, LocalDate end);
}
