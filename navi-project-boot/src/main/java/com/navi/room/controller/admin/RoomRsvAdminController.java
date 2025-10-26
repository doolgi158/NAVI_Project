package com.navi.room.controller.admin;

import com.navi.common.response.ApiResponse;
import com.navi.room.dto.response.RoomRsvResponseDTO;
import com.navi.room.service.RoomRsvService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adm/room/reserve")
public class RoomRsvAdminController {

    private final RoomRsvService roomRsvService;

    /* 관리자용 객실 예약 목록 조회 (페이징 + 필터 + 키워드 검색) */
    @GetMapping("/list")
    public ApiResponse<Map<String, Object>> getReservationList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "") String keyword
    ) {
        log.info("📋 [ADMIN] 객실 예약 목록 조회 - page={}, size={}, status={}, keyword={}", page, size, status, keyword);

        Map<String, Object> result = roomRsvService.getAdminReservationList(page, size, status, keyword);
        return ApiResponse.success(result);
    }


    /* 관리자용 단일 예약 상세 조회 */
    @GetMapping("/{reserveId}")
    public ApiResponse<RoomRsvResponseDTO> getReservationDetail(@PathVariable String reserveId) {
        log.info("🔍 [ADMIN] 예약 상세 조회 - {}", reserveId);
        return ApiResponse.success(roomRsvService.findByReserveId(reserveId));
    }

    /* 관리자용 예약 상태 강제 변경 */
    @PutMapping("/{reserveId}/status")
    public ApiResponse<String> changeReservationStatus(
            @PathVariable String reserveId,
            @RequestParam String status
    ) {
        log.info("⚙️ [ADMIN] 예약 상태 변경 - {} → {}", reserveId, status);
        roomRsvService.updateStatus(reserveId, status);
        return ApiResponse.success("예약 상태가 변경되었습니다.");
    }
}
