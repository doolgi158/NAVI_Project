package com.navi.delivery.controller;

import com.navi.delivery.domain.Delivery;
import com.navi.delivery.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 짐배송 요청 관리 컨트롤러
 * - 배송 등록, 조회, 삭제 기능 제공
 */
@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    /**
     * 전체 배송 요청 조회
     */
    @GetMapping
    public ResponseEntity<List<Delivery>> getAllDeliveries() {
        return ResponseEntity.ok(deliveryService.getAllDeliveries());
    }

    /**
     * 단일 배송 요청 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<Delivery> getDelivery(@PathVariable Long id) {
        return deliveryService.getDelivery(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 배송 요청 등록 또는 수정
     */
    @PostMapping
    public ResponseEntity<Delivery> createOrUpdateDelivery(@RequestBody Delivery delivery) {
        return ResponseEntity.ok(deliveryService.saveDelivery(delivery));
    }

    /**
     * 배송 요청 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDelivery(@PathVariable Long id) {
        deliveryService.deleteDelivery(id);
        return ResponseEntity.noContent().build();
    }
}
