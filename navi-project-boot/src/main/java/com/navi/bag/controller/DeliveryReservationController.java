package com.navi.bag.controller;

import com.navi.bag.domain.DeliveryReservation;
import com.navi.bag.service.DeliveryReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 짐배송 예약 상세 관리 컨트롤러
 * - 예약 등록, 조회, 삭제 기능 제공
 */
@RestController
@RequestMapping("/api/delivery/rsv")
@RequiredArgsConstructor
public class DeliveryReservationController {

    private final DeliveryReservationService deliveryReservationService;

    /**
     * 전체 예약 조회
     */
    @GetMapping
    public ResponseEntity<List<DeliveryReservation>> getAllReservations() {
        return ResponseEntity.ok(deliveryReservationService.getAllReservations());
    }

    /**
     * 단일 예약 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<DeliveryReservation> getReservation(@PathVariable Long id) {
        return deliveryReservationService.getReservation(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 예약 등록 또는 수정
     */
    @PostMapping
    public ResponseEntity<DeliveryReservation> createOrUpdateReservation(@RequestBody DeliveryReservation reservation) {
        return ResponseEntity.ok(deliveryReservationService.saveReservation(reservation));
    }

    /**
     * 예약 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long id) {
        deliveryReservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}
