package com.navi.accommodation.controller;

import com.navi.accommodation.dto.request.AccRsvRequestDTO;
import com.navi.accommodation.service.AccRsvService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/accommodation/reserve")
public class AccRsvController {
    private final AccRsvService accRsvService;

    /* 숙소 상세 예약 생성 */
    @PostMapping("/detail")
    public ResponseEntity<String> createAccReservation(@RequestBody AccRsvRequestDTO dto) {
        log.info("[AccRsvController] 숙소 상세 예약 요청 수신 → reserveId={}, roomId={}, 기간:{}~{}",
                dto.getReserveId(), dto.getRoomId(), dto.getStartDate(), dto.getEndDate());

        accRsvService.createAccReservation(dto);

        return ResponseEntity.ok("✅ 숙소 상세 예약 생성 완료");
    }
}
