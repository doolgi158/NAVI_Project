package com.navi.flight.service;

import com.navi.flight.domain.FlightReservation;
import com.navi.flight.dto.FlightReservationDTO;

import java.math.BigDecimal;
import java.util.List;

public interface FlightReservationService {

    // 예약 생성 (결제 전 0원)
    FlightReservationDTO createReservation(FlightReservationDTO dto);

    // 복수 예약 생성(왕복의 경우 한번에 처리)
    List<FlightReservationDTO> createBatchReservations(List<FlightReservationDTO> dtos);

    // 결제 성공 후 금액 업데이트
    FlightReservation updatePayment(String frsvId, BigDecimal amount);

    // 상태 변경 (FAILED, CANCELLED 등)
    FlightReservation updateStatus(String frsvId, String status);

    // 단일 예약 조회
    FlightReservation getReservationById(String frsvId);

    // 사용자별 예약 목록 조회
    List<FlightReservation> getReservationsByUser(Long userNo);

    // 사용자별 예약 목록 조회(DTO)
    List<FlightReservationDTO> getReservationsByUserDTO(Long userNo);

    // 예약 총액 조회
    BigDecimal getTotalAmountByReserveId(String frsvId);

    BigDecimal getTotalAmountByReserveIds(List<String> reserveIds);

    // 부분 수정 (좌석, 결제일자 등)
    FlightReservation partialUpdate(String frsvId, FlightReservationDTO dto);
}
