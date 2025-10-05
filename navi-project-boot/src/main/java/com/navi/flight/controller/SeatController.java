package com.navi.flight.controller;

import com.navi.flight.dto.SeatStatusDTO;
import com.navi.flight.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ✈️ SeatController
 * - /api/seats/status        : 전체 항공편별 좌석 현황 조회
 * - /api/seats/status/{id}   : 특정 항공편 좌석 현황 조회
 */
@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    /** ✅ 전체 항공편별 좌석 현황 조회 */
    @GetMapping("/status")
    public List<SeatStatusDTO> getAllSeatStatus() {
        return seatService.getSeatStatusByFlight();
    }

    /** ✅ 특정 항공편 좌석 현황 조회 */
    @GetMapping("/status/{flightId}")
    public SeatStatusDTO getSeatStatusByFlightId(@PathVariable("flightId") String flightId) {
        return seatService.getSeatStatusByFlightId(flightId);
    }
}
