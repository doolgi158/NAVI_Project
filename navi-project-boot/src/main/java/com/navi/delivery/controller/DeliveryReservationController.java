package com.navi.delivery.controller;

import com.navi.common.response.ApiResponse;
import com.navi.delivery.domain.DeliveryReservation;
import com.navi.delivery.dto.DeliveryReservationDTO;
import com.navi.delivery.service.DeliveryReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/delivery")
public class DeliveryReservationController {

    private final DeliveryReservationService deliveryReservationService;

    /**
     * ✅ 1. 짐배송 예약 등록
     * - groupId는 서버에서 자동 생성 또는 연결
     * - status 기본값은 PENDING
     */
    @PostMapping("/rsv")
    public ResponseEntity<ApiResponse<DeliveryReservation>> createReservation(@RequestBody DeliveryReservationDTO dto) {
        DeliveryReservation reservation = deliveryReservationService.createReservation(dto);
        return ResponseEntity.ok(ApiResponse.success(reservation));
    }

    /*
     * 2. 특정 사용자 예약 목록 조회
     * - /api/delivery/user/{userNo}
     */
    @GetMapping("/user/{userNo}")
    public ResponseEntity<ApiResponse<List<DeliveryReservation>>> getReservationsByUser(@PathVariable Long userNo) {
        List<DeliveryReservation> reservations = deliveryReservationService.getReservationsByUser(userNo);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    /*
     * 3. 단일 예약 상세 조회
     * - /api/delivery/rsv/{drsvId}
     */
    @GetMapping("/rsv/{drsvId}")
    public ResponseEntity<ApiResponse<DeliveryReservation>> getReservationById(@PathVariable String drsvId) {
        DeliveryReservation reservation = deliveryReservationService.getReservationById(drsvId);
        return ResponseEntity.ok(ApiResponse.success(reservation));
    }

    /*
     * 4. 예약 상태 변경 (결제 완료 등)
     * - 예시: /api/delivery/rsv/{drsvId}/status?value=PAID
     */
    @PatchMapping("/rsv/{drsvId}/status")
    public ResponseEntity<ApiResponse<DeliveryReservation>> updateStatus(
            @PathVariable String drsvId,
            @RequestParam("value") String status
    ) {
        DeliveryReservation updated = deliveryReservationService.updateStatus(drsvId, status);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
}
