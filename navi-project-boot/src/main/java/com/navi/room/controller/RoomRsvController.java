package com.navi.room.controller;

import com.navi.common.response.ApiResponse;
import com.navi.room.dto.request.ReserverUpdateRequestDTO;
import com.navi.room.dto.request.RoomRsvRequestDTO;
import com.navi.room.dto.response.RoomPreRsvResponseDTO;
import com.navi.room.dto.response.RoomRsvResponseDTO;
import com.navi.room.service.RoomRsvService;
import com.navi.user.dto.auth.UserSecurityDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/room/reserve")
public class RoomRsvController {

    private final RoomRsvService roomRsvService;

    /* 결제 전 예약 임시 생성 (재고 선점용) */
    @PostMapping("/pending")
    public ResponseEntity<RoomPreRsvResponseDTO> createPendingReservation(@RequestBody List<RoomRsvRequestDTO> dtoList) {
        if (dtoList.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(RoomPreRsvResponseDTO.builder()
                            .success(false)
                            .message("요청 데이터가 비어있습니다.")
                            .build());
        }

        try {
            RoomPreRsvResponseDTO created =
                    (dtoList.size() == 1)
                            ? roomRsvService.createRoomReservation(dtoList.get(0))
                            : roomRsvService.createMultipleRoomReservations(dtoList);

            return ResponseEntity.ok(created);

        } catch (Exception e) {
            log.error("❌ 예약 생성 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(RoomPreRsvResponseDTO.builder()
                            .success(false)
                            .message("❌ 예약 생성 실패: " + e.getMessage())
                            .build());
        }
    }

    /* 예약자 정보 업데이트 */
    @PutMapping("/{reserveId}/reserver")
    public ResponseEntity<String> updateReserverInfo(
            @PathVariable String reserveId,
            @RequestBody ReserverUpdateRequestDTO dto) {

        roomRsvService.updateReserverInfo(reserveId, dto.getReserverName(), dto.getReserverTel(), dto.getReserverEmail());
        return ResponseEntity.ok("✅ 예약자 정보가 업데이트되었습니다.");
    }

    /* 결제 완료 후 예약 확정 */
    @PutMapping("/{reserveId}/confirm")
    public ResponseEntity<Map<String, Object>> confirmReservation(@PathVariable String reserveId) {
        roomRsvService.updateStatus(reserveId, "PAID");
        return ResponseEntity.ok(Map.of(
                "success", true,
                "status", "PAID",
                "message", "✅ 객실 예약 확정 완료"
        ));
    }

    /* 결제 취소 시 예약 취소 */
    @PutMapping("/{reserveId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelReservation(@PathVariable String reserveId) {
        roomRsvService.updateStatus(reserveId, "CANCELLED");
        return ResponseEntity.ok(Map.of(
                "success", true,
                "status", "CANCELLED",
                "message", "❌ 객실 예약 취소 완료"
        ));
    }

    /* 사용자별 예약 목록 조회 */
    @GetMapping
    public ApiResponse<List<RoomRsvResponseDTO>> getReservations(@AuthenticationPrincipal UserSecurityDTO userSecurity) {
        if (userSecurity == null) {
            throw new IllegalArgumentException("❌ 로그인 정보가 없습니다. 토큰이 만료되었을 수 있습니다.");
        }

        log.info("🔐 [예약 조회 요청] 토큰 기반 사용자: {}", userSecurity.getId());

        List<RoomRsvResponseDTO> list = roomRsvService.findAllByUserId(userSecurity.getId());

        return ApiResponse.success(list);
    }
}

