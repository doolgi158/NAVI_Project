package com.navi.flight.admin.controller;

import com.navi.flight.admin.dto.AdminFlightDTO;
import com.navi.flight.admin.service.AdminFlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/flights")
@RequiredArgsConstructor
public class AdminFlightController {

    private final AdminFlightService adminFlightService;

    @GetMapping
    public List<AdminFlightDTO> getAllFlights() {
        return adminFlightService.getAllFlights();
    }

    @GetMapping("/{flightId}/{depTime}")
    public AdminFlightDTO getFlight(
            @PathVariable String flightId,
            @PathVariable LocalDateTime depTime
    ) {
        return adminFlightService.getFlight(flightId, depTime);
    }

    @PostMapping
    public AdminFlightDTO createFlight(@RequestBody AdminFlightDTO dto) {
        return adminFlightService.createFlight(dto);
    }

    @PutMapping("/{flightId}/{depTime}")
    public AdminFlightDTO updateFlight(
            @PathVariable String flightId,
            @PathVariable LocalDateTime depTime,
            @RequestBody AdminFlightDTO dto
    ) {
        return adminFlightService.updateFlight(flightId, depTime, dto);
    }

    @DeleteMapping("/{flightId}/{depTime}")
    public void deleteFlight(
            @PathVariable String flightId,
            @PathVariable LocalDateTime depTime
    ) {
        adminFlightService.deleteFlight(flightId, depTime);
    }
}
