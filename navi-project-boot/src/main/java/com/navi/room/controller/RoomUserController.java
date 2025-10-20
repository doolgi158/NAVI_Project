package com.navi.room.controller;

import com.navi.room.dto.response.RoomListResponseDTO;
import com.navi.room.dto.response.StockResponseDTO;
import com.navi.room.service.RoomService;
import com.navi.room.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Slf4j
public class RoomUserController {

    private final RoomService roomService;
    private final StockService stockService; // ✅ 재고 조회용 서비스 추가

    /* ✅ 1️⃣ 숙소별 객실 리스트 조회 */
    @GetMapping("/{accId}")
    public ResponseEntity<List<RoomListResponseDTO>> getRoomsByAccId(
            @PathVariable String accId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false) Integer guestCount,
            @RequestParam(required = false) Integer roomCount
    ) {
        log.info("[USER] 숙소별 객실 리스트 조회 - accId: {}, checkIn={}, checkOut={}", accId, checkIn, checkOut);

        List<RoomListResponseDTO> result = roomService.getAvailableRooms(
                accId, checkIn, checkOut, guestCount, roomCount
        );

        return ResponseEntity.ok(result);
    }

    /* ✅ 2️⃣ 특정 객실의 기간별 재고 조회 */
    // 예: GET /api/rooms/stock/ROM001?checkIn=2025-10-20&checkOut=2025-10-23
    @GetMapping("/stock/{roomId}")
    public ResponseEntity<List<StockResponseDTO>> getStockByRoomAndPeriod(
            @PathVariable String roomId,
            @RequestParam("checkIn") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam("checkOut") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        log.info("[USER] 객실 재고 조회 요청 - roomId={}, 기간:{}~{}", roomId, checkIn, checkOut);

        List<StockResponseDTO> result = stockService.getStockByRoomAndPeriod(
                roomId, checkIn, checkOut.minusDays(1)
        );

        return ResponseEntity.ok(result);
    }
}
