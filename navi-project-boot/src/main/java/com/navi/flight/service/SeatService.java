package com.navi.flight.service;

import com.navi.flight.domain.Seat;
import com.navi.flight.dto.SeatResponseDTO;
import java.time.LocalDateTime;
import java.util.List;

public interface SeatService {

    /** 항공편별 좌석 조회 (없으면 자동 생성) */
    List<SeatResponseDTO> getSeatsByFlight(String flightId, LocalDateTime depTime);

    /** 자동 좌석 배정 (탑승객 수 기반) */
    List<Seat> autoAssignSeats(String flightId, LocalDateTime depTime, int passengerCount);

    /** 좌석 초기화 상태 보장 (폴링 시 사용) */
    boolean ensureSeatsInitialized(String flightId, LocalDateTime depTime);
}
