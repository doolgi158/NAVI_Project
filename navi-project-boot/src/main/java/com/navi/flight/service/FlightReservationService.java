package com.navi.flight.service;

import com.navi.flight.domain.FlightReservation;
import com.navi.flight.dto.FlightReservationDTO;
import java.util.List;

public interface FlightReservationService {

    // 항공편 예약 생성
    FlightReservation createReservation(FlightReservationDTO dto);

    // 특정 사용자 예약 목록 조회
    List<FlightReservation> getReservationsByUser(Long userNo);

    // 예약 상태 변경 (결제 완료, 취소 등)
    void updateStatus(String frsvId, String status);
}
