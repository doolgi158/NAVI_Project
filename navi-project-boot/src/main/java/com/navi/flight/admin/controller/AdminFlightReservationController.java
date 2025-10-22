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

    /** ✅ 전체 예약 목록 조회 */
    @GetMapping
    public ResponseEntity<List<AdminFlightReservationDTO>> getAllReservations(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        return ResponseEntity.ok(
                reservationService.findReservations(status, userName, startDate, endDate)
        );
    }

    /** ✅ 단건 조회 */
    @GetMapping("/{rsvId}")
    public ResponseEntity<AdminFlightReservationDTO> getReservation(@PathVariable String rsvId) {
        return ResponseEntity.ok(reservationService.findById(rsvId));
    }

    /** ✅ 상태 변경 */
    @PatchMapping("/{rsvId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable String rsvId,
            @RequestParam String status
    ) {
        reservationService.updateStatus(rsvId, status);
        return ResponseEntity.ok().build();
    }

    /** ✅ 예약 전체 수정 (좌석/상태/금액) */
    @PutMapping("/{rsvId}")
    public ResponseEntity<Void> updateReservation(
            @PathVariable String rsvId,
            @RequestBody AdminFlightReservationDTO dto
    ) {
        reservationService.updateReservation(rsvId, dto);
        return ResponseEntity.ok().build();
    }

    /** ✅ 예약 삭제 (결제완료 금지 + 좌석 복구) */
    @DeleteMapping("/{rsvId}")
    public ResponseEntity<Void> deleteReservation(@PathVariable String rsvId) {
        reservationService.deleteReservation(rsvId);
        return ResponseEntity.ok().build();
    }
}
