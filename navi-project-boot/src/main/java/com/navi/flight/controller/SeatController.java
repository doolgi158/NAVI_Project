package com.navi.flight.controller;

import com.navi.flight.dto.SeatResponseDTO;
import com.navi.flight.domain.Seat;
import com.navi.flight.dto.SeatStatusResponse;
import com.navi.flight.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/seats")
public class SeatController {

    private final SeatService seatService;

    @GetMapping("/{flightId}")
    public ResponseEntity<List<SeatResponseDTO>> getSeatsByFlight(
            @PathVariable String flightId,
            @RequestParam("depTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime depTime
    ) {
        List<SeatResponseDTO> seats = seatService.getSeatsByFlight(flightId, depTime);
        return ResponseEntity.ok(seats);
    }

    @PostMapping("/auto/{flightId}")
    public ResponseEntity<List<Seat>> autoAssignSeats(
            @PathVariable String flightId,
            @RequestParam("depTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime depTime,
            @RequestParam(name = "count", defaultValue = "1") int passengerCount
    ) {
        List<Seat> assignedSeats = seatService.autoAssignSeats(flightId, depTime, passengerCount);
        return ResponseEntity.ok(assignedSeats);
    }

    @GetMapping("/{flightId}/status")
    public ResponseEntity<SeatStatusResponse> checkSeatStatus(
            @PathVariable String flightId,
            @RequestParam("depTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime depTime
    ) {
        boolean initialized = seatService.ensureSeatsInitialized(flightId, depTime);
        return ResponseEntity.ok(new SeatStatusResponse(initialized));
    }

}
