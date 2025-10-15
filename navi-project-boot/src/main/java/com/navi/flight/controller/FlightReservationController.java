package com.navi.flight.controller;

import com.navi.common.response.ApiResponse;
import com.navi.flight.domain.FlightReservation;
import com.navi.flight.dto.FlightReservationDTO;
import com.navi.flight.service.FlightReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 *  항공편 예약 컨트롤러
 * - 항공편 예약 생성
 * - 사용자별 예약 조회
 * - 예약 상태 변경 (결제 완료 등)
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/flight/rsv")
public class FlightReservationController {

    private final FlightReservationService reservationService;

    /* 예약 생성 */
    @PostMapping
    public ResponseEntity<ApiResponse<FlightReservation>> createReservation(
            @RequestBody FlightReservationDTO dto
    ) {
        FlightReservation reservation = reservationService.createReservation(dto);
        return ResponseEntity.ok(ApiResponse.success(reservation));
    }

    /* 특정 사용자 예약 조회 */
    @GetMapping("/user/{userNo}")
    public ResponseEntity<ApiResponse<List<FlightReservation>>> getReservationsByUser(
            @PathVariable Long userNo
    ) {
        List<FlightReservation> reservations = reservationService.getReservationsByUser(userNo);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    /* 상태 변경 (예: 결제 완료 → PAID) */
    @PutMapping("/{frsvId}/status")
    public ResponseEntity<ApiResponse<String>> updateStatus(
            @PathVariable String frsvId,
            @RequestParam String status
    ) {
        reservationService.updateStatus(frsvId, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated: " + status));
    }
}
