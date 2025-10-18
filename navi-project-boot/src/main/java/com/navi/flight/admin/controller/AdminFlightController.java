package com.navi.flight.admin.controller;

import com.navi.flight.admin.dto.AdminFlightDTO;
import com.navi.flight.admin.service.AdminFlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ✈️ AdminFlightController
 * - 관리자 항공편 관리용 CRUD 컨트롤러
 * - 전체 조회 / 단건 조회 / 등록 / 수정 / 삭제 지원
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/flights")
@RequiredArgsConstructor
public class AdminFlightController {

    private final AdminFlightService adminFlightService;

    /** ✅ 전체 항공편 목록 조회 */
    @GetMapping
    public ResponseEntity<List<AdminFlightDTO>> getAllFlights() {
        log.info("[ADMIN] 전체 항공편 목록 조회 요청");
        List<AdminFlightDTO> flights = adminFlightService.getAllFlights();
        return ResponseEntity.ok(flights);
    }

    /** ✅ 단건 항공편 조회 */
    @GetMapping("/{flightId}/{depTime}")
    public ResponseEntity<AdminFlightDTO> getFlight(
            @PathVariable String flightId,
            @PathVariable LocalDateTime depTime
    ) {
        log.info("[ADMIN] 항공편 단건 조회 요청: flightId={}, depTime={}", flightId, depTime);
        AdminFlightDTO dto = adminFlightService.getFlight(flightId, depTime);
        return ResponseEntity.ok(dto);
    }

    /** ✅ 항공편 등록 */
    @PostMapping
    public ResponseEntity<AdminFlightDTO> createFlight(@RequestBody AdminFlightDTO dto) {
        log.info("[ADMIN] 항공편 등록 요청: {}", dto);
        AdminFlightDTO created = adminFlightService.createFlight(dto);
        return ResponseEntity.ok(created);
    }

    /** ✅ 항공편 수정 */
    @PutMapping("/{flightId}/{depTime}")
    public ResponseEntity<AdminFlightDTO> updateFlight(
            @PathVariable String flightId,
            @PathVariable LocalDateTime depTime,
            @RequestBody AdminFlightDTO dto
    ) {
        log.info("[ADMIN] 항공편 수정 요청: flightId={}, depTime={}", flightId, depTime);
        AdminFlightDTO updated = adminFlightService.updateFlight(flightId, depTime, dto);
        return ResponseEntity.ok(updated);
    }

    /** ✅ 항공편 삭제 */
    @DeleteMapping("/{flightId}/{depTime}")
    public ResponseEntity<Void> deleteFlight(
            @PathVariable String flightId,
            @PathVariable LocalDateTime depTime
    ) {
        log.info("[ADMIN] 항공편 삭제 요청: flightId={}, depTime={}", flightId, depTime);
        adminFlightService.deleteFlight(flightId, depTime);
        return ResponseEntity.noContent().build();
    }
}
