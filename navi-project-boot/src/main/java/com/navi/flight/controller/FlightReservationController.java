package com.navi.flight.controller;

import com.navi.common.response.ApiResponse;
import com.navi.flight.domain.FlightReservation;
import com.navi.flight.dto.FlightReservationDTO;
import com.navi.flight.service.FlightReservationService;
import com.navi.user.dto.users.UserSecurityDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/flight")
public class FlightReservationController {

    private final FlightReservationService reservationService;

    /* 1. 예약 생성 (임시값으로 생성: totalPrice=0, seat=null, status=PENDING) */
    @PostMapping("/reservation")
    public ResponseEntity<ApiResponse<FlightReservationDTO>> createReservation(
            @RequestBody FlightReservationDTO dto,
            @AuthenticationPrincipal UserSecurityDTO user
    ) {
        dto.setUserNo(user.getNo()); // ✅ JWT 토큰 기반 자동 연결
        FlightReservationDTO saved = reservationService.createReservation(dto);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    /* 2. 사용자별 예약 조회 */
    @GetMapping("/user/{userNo}")
    public ResponseEntity<ApiResponse<List<FlightReservation>>> getReservationsByUser(
            @PathVariable Long userNo
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.getReservationsByUser(userNo)
        ));
    }

    /* 3. 단일 예약 조회 */
    @GetMapping("/{frsvId}")
    public ResponseEntity<ApiResponse<FlightReservation>> getReservationById(
            @PathVariable String frsvId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.getReservationById(frsvId)
        ));
    }

    /* 4. 예약 상태 변경 (PENDING → PAID 등) */
    @PatchMapping("/{frsvId}/status")
    public ResponseEntity<ApiResponse<FlightReservation>> updateStatus(
            @PathVariable String frsvId,
            @RequestParam("value") String status
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.updateStatus(frsvId, status)
        ));
    }

    /* ✅ 5. 예약 일부 수정 (결제 이후 금액·좌석·상태·paidAt 갱신용) */
    @PatchMapping("/rsv/{frsvId}")
    public ResponseEntity<ApiResponse<FlightReservation>> updateReservation(
            @PathVariable String frsvId,
            @RequestBody FlightReservationDTO dto
    ) {
        FlightReservation updated = ((com.navi.flight.service.FlightReservationServiceImpl) reservationService)
                .partialUpdate(frsvId, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
}
