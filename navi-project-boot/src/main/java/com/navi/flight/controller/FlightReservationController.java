package com.navi.flight.controller;

import com.navi.common.response.ApiResponse;
import com.navi.flight.domain.FlightReservation;
import com.navi.flight.dto.FlightReservationDTO;
import com.navi.flight.service.FlightReservationService;
import com.navi.user.dto.users.UserSecurityDTO;
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

    /* 예약 생성 (임시값으로 생성: totalPrice=0, seat=null, status=PENDING) */
    @PostMapping("/reservation")
    public ResponseEntity<ApiResponse<FlightReservationDTO>> createReservation(
            @RequestBody FlightReservationDTO dto,
            @AuthenticationPrincipal UserSecurityDTO user
    ) {
        dto.setUserNo(user.getNo());
        FlightReservationDTO saved = reservationService.createReservation(dto);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    /* 복수 예약 생성 (왕복 결제 시 한 번에 insert) */
    @PostMapping("/reservation/batch")
    public ResponseEntity<ApiResponse<List<FlightReservationDTO>>> createBatchReservations(
            @RequestBody List<FlightReservationDTO> dtos,
            @AuthenticationPrincipal UserSecurityDTO user
    ) {
        dtos.forEach(dto -> dto.setUserNo(user.getNo()));
        List<FlightReservationDTO> savedList = reservationService.createBatchReservations(dtos);
        return ResponseEntity.ok(ApiResponse.success(savedList));
    }

    /* 사용자별 예약 조회 */
    @GetMapping("/user/{userNo}")
    public ResponseEntity<ApiResponse<List<FlightReservation>>> getReservationsByUser(
            @PathVariable Long userNo
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.getReservationsByUser(userNo)
        ));
    }

    /* 마이페이지용 사용자별 예약 조회 */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<FlightReservationDTO>>> getMyReservations(
            @AuthenticationPrincipal UserSecurityDTO user
    ) {
        List<FlightReservationDTO> list = reservationService.getReservationsByUserDTO(user.getNo());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /* 단일 예약 조회 */
    @GetMapping("/{frsvId}")
    public ResponseEntity<ApiResponse<FlightReservation>> getReservationById(
            @PathVariable String frsvId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                reservationService.getReservationById(frsvId)
        ));
    }

    /* 예약 일부 수정 (결제 이후 금액·좌석·상태·paidAt 갱신용) */
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
