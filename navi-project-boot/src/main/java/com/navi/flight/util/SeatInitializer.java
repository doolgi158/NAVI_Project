package com.navi.flight.util;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.Seat;
import com.navi.flight.domain.SeatClass;
import com.navi.flight.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/*
 * 공통 좌석 생성 유틸
 * - Flight 기반으로 1~30행 × 6열 좌석 자동 생성
 * - 1~5행: 프레스티지 / 6~30행: 일반석
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SeatInitializer {

    private final SeatRepository seatRepository;

    public List<Seat> createSeatsForFlight(Flight flight) {
        // 이미 좌석 존재하면 생성하지 않음
        var existingSeats = seatRepository.findByFlightAndDepTime(
                flight.getFlightId().getFlightId(),
                flight.getFlightId().getDepTime()
        );
        if (!existingSeats.isEmpty()) {
            log.warn("[SeatInitializer] 이미 좌석이 존재함 → 생성 스킵 ({}석)", existingSeats.size());
            return existingSeats;
        }

        List<Seat> newSeats = new ArrayList<>();
        char[] cols = {'A', 'B', 'C', 'D', 'E', 'F'};

        for (int row = 1; row <= 30; row++) {
            for (char col : cols) {
                newSeats.add(
                        Seat.builder()
                                .flight(flight)
                                .seatNo(row + String.valueOf(col))
                                .seatClass(row <= 5 ? SeatClass.PRESTIGE : SeatClass.ECONOMY)
                                .extraPrice(0)
                                .isReserved(false)
                                .build()
                );
            }
        }

        seatRepository.saveAll(newSeats);

        // ✅ 좌석 생성 완료 후 Flight 상태 플래그 true로 변경
        flight.setSeatInitialized(true);
        log.info("[SeatInitializer] {} 좌석 자동 생성 완료 (총 {}석)", flight.getFlightId().getFlightId(), newSeats.size());
        return newSeats;
    }
}
