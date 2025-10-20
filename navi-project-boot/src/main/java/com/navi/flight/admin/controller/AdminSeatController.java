package com.navi.flight.admin.controller;

import com.navi.flight.admin.dto.AdminSeatDTO;
import com.navi.flight.admin.dto.AdminSeatUpdateRequest;
import com.navi.flight.admin.service.AdminSeatService;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.util.SeatInitializer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/seats")
@RequiredArgsConstructor
@Slf4j
public class AdminSeatController {

    private final FlightRepository flightRepository;
    private final AdminSeatService adminSeatService;
    private final SeatInitializer seatInitializer;

    /**
     * ✅ 특정 항공편 좌석 조회
     */
    @GetMapping
    public ResponseEntity<List<AdminSeatDTO>> getSeats(
            @RequestParam String flightId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime depTime
    ) {
        log.info("[ADMIN] 항공편 좌석 조회 요청 - flightId={}, depTime={}", flightId, depTime);

        var flightKey = new FlightId(flightId, depTime);
        var flightOpt = flightRepository.findById(flightKey);

        if (flightOpt.isEmpty()) return ResponseEntity.ok(List.of());
        Flight flight = flightOpt.get();

        if (!flight.isSeatInitialized()) {
            seatInitializer.createSeatsForFlight(flight);
        }

        return ResponseEntity.ok(adminSeatService.getSeatsByFlight(flightId, depTime));
    }

    @GetMapping("/all")
    public ResponseEntity<List<AdminSeatDTO>> getAllSeats() {
        log.info("[ADMIN] 전체 좌석 조회 요청");
        return ResponseEntity.ok(adminSeatService.getAllSeats());
    }

    /**
     * ✅ 새 좌석 등록 (빈 번호 자동 배정)
     */
    @PostMapping("/flight/{flightId}/auto")
    public ResponseEntity<AdminSeatDTO> addSeat(
            @PathVariable String flightId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime depTime
    ) {
        log.info("[ADMIN] 좌석 추가 요청 - flightId={}, depTime={}", flightId, depTime);
        return ResponseEntity.ok(adminSeatService.addSeat(flightId, depTime));
    }

    /**
     * ✅ 좌석 수정 (PUT으로 변경 — PATCH CORS 문제 방지)
     */
    @PutMapping("/single/{seatId}")
    public ResponseEntity<AdminSeatDTO> updateSeat(
            @PathVariable Long seatId,
            @RequestBody AdminSeatUpdateRequest req
    ) {
        log.info("[ADMIN] 좌석 수정 요청 - seatId={}", seatId);
        return ResponseEntity.ok(adminSeatService.patchSeat(seatId, req));
    }

    /**
     * ✅ 개별 좌석 삭제
     */
    @DeleteMapping("/single/{seatId}")
    public ResponseEntity<String> deleteSeat(@PathVariable Long seatId) {
        log.info("[ADMIN] 개별 좌석 삭제 요청 - seatId={}", seatId);
        adminSeatService.deleteOne(seatId);
        return ResponseEntity.ok("삭제 완료");
    }

    /**
     * ✅ 항공편 좌석 초기화
     */
    @PostMapping("/flight/{flightId}/reset")
    public ResponseEntity<String> resetSeats(
            @PathVariable String flightId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime depTime
    ) {
        adminSeatService.resetSeats(flightId, depTime);
        return ResponseEntity.ok("좌석 초기화 완료");
    }

    /**
     * ✅ 항공편 전체 좌석 삭제
     */
    @DeleteMapping("/flight/{flightId}")
    public ResponseEntity<String> deleteSeats(
            @PathVariable String flightId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime depTime
    ) {
        adminSeatService.deleteSeats(flightId, depTime);
        return ResponseEntity.ok("항공편 좌석 전체 삭제 완료");
    }
}
