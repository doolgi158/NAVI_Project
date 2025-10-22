package com.navi.delivery.admin.controller;

import com.navi.common.response.ApiResponse;
import com.navi.delivery.admin.dto.AdminDeliveryReservationDTO;
import com.navi.delivery.admin.service.AdminDeliveryReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/deliveries/reservations")
@RequiredArgsConstructor
public class AdminDeliveryReservationController {

    private final AdminDeliveryReservationService reservationService;

    @GetMapping
    public ApiResponse<List<AdminDeliveryReservationDTO>> getAllReservations() {
        return ApiResponse.success(reservationService.getAllReservations());
    }

    @GetMapping("/{drsvId}")
    public ApiResponse<AdminDeliveryReservationDTO> getReservation(@PathVariable String drsvId) {
        return ApiResponse.success(reservationService.getReservation(drsvId));
    }

    @PutMapping("/{drsvId}")
    public ApiResponse<AdminDeliveryReservationDTO> updateReservation(
            @PathVariable String drsvId,
            @RequestBody AdminDeliveryReservationDTO dto
    ) {
        return ApiResponse.success(reservationService.updateReservation(drsvId, dto));
    }

    @DeleteMapping("/{drsvId}")
    public ApiResponse<Void> deleteReservation(@PathVariable String drsvId) {
        reservationService.deleteReservation(drsvId);
        return ApiResponse.success(null);
    }
}
