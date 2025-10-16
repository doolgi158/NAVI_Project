package com.navi.flight.controller;

import com.navi.common.response.ApiResponse;
import com.navi.flight.domain.FlightReservation;
import com.navi.flight.dto.FlightReservationDTO;
import com.navi.flight.service.FlightReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/flight/reservation")
public class FlightReservationController {

    private final FlightReservationService reservationService;

    /* 1.예약 생성 */
    @PostMapping
    public ResponseEntity<ApiResponse<FlightReservation>> createReservation(
            @Valid @RequestBody FlightReservationDTO dto) {
        FlightReservation reservation = reservationService.createReservation(dto);
        return ResponseEntity.ok(ApiResponse.success(reservation));
    }

    /* 2.사용자별 예약 조회 */
    @GetMapping("/user/{userNo}")
    public ResponseEntity<ApiResponse<List<FlightReservation>>> getReservationsByUser(
            @PathVariable Long userNo) {
        return ResponseEntity.ok(ApiResponse.success(reservationService.getReservationsByUser(userNo)));
    }

    /* 3.단일 예약 조회 */
    @GetMapping("/{frsvId}")
    public ResponseEntity<ApiResponse<FlightReservation>> getReservationById(@PathVariable String frsvId) {
        return ResponseEntity.ok(ApiResponse.success(reservationService.getReservationById(frsvId)));
    }

    /* 4.예약 상태 변경 */
    @PatchMapping("/{frsvId}/status")
    public ResponseEntity<ApiResponse<FlightReservation>> updateStatus(
            @PathVariable String frsvId,
            @RequestParam("value") String status) {
        return ResponseEntity.ok(ApiResponse.success(reservationService.updateStatus(frsvId, status)));
    }
}
