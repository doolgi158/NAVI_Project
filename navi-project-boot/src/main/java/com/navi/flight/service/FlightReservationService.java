package com.navi.flight.service;

import com.navi.flight.domain.FlightReservation;
import com.navi.flight.dto.FlightReservationDTO;

import java.math.BigDecimal;
import java.util.List;

public interface FlightReservationService {

    /** 항공편 예약 등록 */
    FlightReservation createReservation(FlightReservationDTO dto);

    /** 사용자별 예약 목록 조회 */
    List<FlightReservation> getReservationsByUser(Long userNo);

    /** 단일 예약 조회 */
    FlightReservation getReservationById(String frsvId);

    /** 예약 상태 변경 */
    FlightReservation updateStatus(String frsvId, String status);

    // 금액 합산용(결제파트)
    BigDecimal getTotalAmountByReserveId(String frsvId);
    BigDecimal getTotalAmountByReserveIds(List<String> reserveIds);
}
