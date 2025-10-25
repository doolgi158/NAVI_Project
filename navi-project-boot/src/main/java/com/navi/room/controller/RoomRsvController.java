package com.navi.room.controller;

import com.navi.room.dto.request.RoomRsvRequestDTO;
import com.navi.room.dto.response.RoomPreRsvResponseDTO;
import com.navi.room.dto.response.RoomRsvResponseDTO;
import com.navi.room.service.RoomRsvService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/room/reserve")
public class RoomRsvController {

    private final RoomRsvService roomRsvService;

    /** ✅ 결제 전 예약 임시 생성 (재고 선점용) */
    @PostMapping("/pending")
    public ResponseEntity<RoomPreRsvResponseDTO> createPendingReservation(@RequestBody List<RoomRsvRequestDTO> dtoList) {
        if (dtoList.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(RoomPreRsvResponseDTO.builder()
                            .success(false)
                            .message("요청 데이터가 비어있습니다.")
                            .build());
        }

        String reserveId = dtoList.get(0).getReserveId();
        Long userNo = dtoList.get(0).getUserNo();

        try {
            if (dtoList.size() == 1) {
                RoomRsvRequestDTO singleDto = dtoList.get(0);
                roomRsvService.createRoomReservation(singleDto);

                return ResponseEntity.ok(RoomPreRsvResponseDTO.builder()
                        .success(true)
                        .reserveId(singleDto.getReserveId())
                        .message("✅ 단일 객실 예약 임시 생성 완료")
                        .build());
            } else {
                roomRsvService.createMultipleRoomReservations(reserveId, userNo, dtoList);
                return ResponseEntity.ok(RoomPreRsvResponseDTO.builder()
                        .success(true)
                        .reserveId(reserveId)
                        .message("✅ 다중 객실 예약 임시 생성 완료")
                        .build());
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(RoomPreRsvResponseDTO.builder()
                            .success(false)
                            .message("❌ 예약 생성 중 오류: " + e.getMessage())
                            .build());
        }
    }

    /** ✅ 결제 완료 후 예약 확정 */
    @PutMapping("/{reserveId}/confirm")
    public ResponseEntity<String> confirmReservation(@PathVariable String reserveId) {
        roomRsvService.updateStatus(reserveId, "PAID");
        return ResponseEntity.ok("✅ 객실 예약 확정 완료");
    }

    /** ✅ 결제 취소 시 예약 취소 */
    @PutMapping("/{reserveId}/cancel")
    public ResponseEntity<String> cancelReservation(@PathVariable String reserveId) {
        roomRsvService.updateStatus(reserveId, "CANCELLED");
        return ResponseEntity.ok("❌ 객실 예약 취소 완료");
    }

    /* 사용자별 예약 목록 조회 */
    @GetMapping
    public ResponseEntity<List<RoomRsvResponseDTO>> getReservations(
            @RequestParam(required = false) String userId) {

        List<RoomRsvResponseDTO> list = roomRsvService.findAllByUserId(userId);

        return ResponseEntity.ok(list);
    }

    /* 단일 예약 상세 조회 */
    @GetMapping("/{reserveId}")
    public ResponseEntity<RoomRsvResponseDTO> getReservationDetail(@PathVariable String reserveId) {
        return ResponseEntity.ok(roomRsvService.findByRoomRsvId(reserveId));
    }
}
