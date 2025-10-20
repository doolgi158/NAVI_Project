package com.navi.flight.admin.controller;

import com.navi.flight.admin.dto.AdminAirportDTO;
import com.navi.flight.admin.service.AdminAirportService;
import com.navi.flight.domain.Airport;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/airports")
@RequiredArgsConstructor
public class AdminAirportController {

    private final AdminAirportService adminAirportService;

    @GetMapping
    public ResponseEntity<List<Airport>> getAll() {
        return ResponseEntity.ok(adminAirportService.findAll());
    }

    @PostMapping
    public ResponseEntity<Airport> create(@RequestBody AdminAirportDTO dto) {
        Airport airport = adminAirportService.createAirport(dto);
        return ResponseEntity.ok(airport);
    }

    @PutMapping("/{airportCode}")
    public ResponseEntity<Airport> updateAirport(
            @PathVariable String airportCode,
            @RequestBody AdminAirportDTO dto
    ) {
        Airport updated = adminAirportService.updateAirport(airportCode, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{airportCode}")
    public ResponseEntity<Void> deleteAirport(@PathVariable String airportCode) {
        adminAirportService.deleteAirport(airportCode);
        return ResponseEntity.noContent().build();
    }
}
