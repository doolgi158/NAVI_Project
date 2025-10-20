package com.navi.room.controller;

import com.navi.room.dto.response.StockResponseDTO;
import com.navi.room.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/stock")
public class StockController {

    private final StockService stockService;

    // 특정 객실의 기간별 재고 조회
    // 예: GET /api/admin/stock/ROM001?startDate=2025-10-18&endDate=2025-11-17
    @GetMapping("/{roomId}")
    public ResponseEntity<List<StockResponseDTO>> getStockByRoomAndPeriod(
            @PathVariable String roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("재고 조회 요청 - roomId={}, 기간:{}~{}", roomId, startDate, endDate);
        List<StockResponseDTO> result = stockService.getStockByRoomAndPeriod(roomId, startDate, endDate);
        return ResponseEntity.ok(result);
    }
}
