package com.navi.flight.admin.controller;

import com.navi.flight.admin.dto.AdminFlightReservationDTO;
import com.navi.flight.admin.service.AdminFlightReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/flight-reservations")
public class AdminFlightReservationController {

    private final AdminFlightReservationService reservationService;

    /**
     * ✅ 전체 예약 목록 조회 (검색 조건 optional)
     */
    @GetMapping
    public ResponseEntity<List<AdminFlightReservationDTO>> getAllReservations(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        List<AdminFlightReservationDTO> list =
                reservationService.findReservations(status, userName, startDate, endDate);
        return ResponseEntity.ok(list);
    }

    /**
     * ✅ 단건 조회
     */
    @GetMapping("/{rsvId}")
    public ResponseEntity<AdminFlightReservationDTO> getReservation(@PathVariable String rsvId) {
        return ResponseEntity.ok(reservationService.findById(rsvId));
    }

    /**
     * ✅ 예약 상태 변경 (PENDING → PAID 등)
     */
    @PatchMapping("/{rsvId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable String rsvId,
            @RequestParam String status
    ) {
        reservationService.updateStatus(rsvId, status);
        return ResponseEntity.ok().build();
    }

    /**
     * ✅ 예약 삭제
     */
    @DeleteMapping("/{rsvId}")
    public ResponseEntity<Void> deleteReservation(@PathVariable String rsvId) {
        reservationService.deleteReservation(rsvId);
        return ResponseEntity.ok().build();
    }

}
