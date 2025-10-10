package com.navi.bag.controller;

import com.navi.bag.domain.DeliveryGroup;
import com.navi.bag.service.DeliveryGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 배차 그룹 관리 컨트롤러
 * - 그룹 등록, 조회, 삭제 기능 제공
 */
@RestController
@RequestMapping("/api/delivery/group")
@RequiredArgsConstructor
public class DeliveryGroupController {

    private final DeliveryGroupService deliveryGroupService;

    /**
     * 전체 배차 그룹 조회
     */
    @GetMapping
    public ResponseEntity<List<DeliveryGroup>> getAllGroups() {
        return ResponseEntity.ok(deliveryGroupService.getAllGroups());
    }

    /**
     * 단일 배차 그룹 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<DeliveryGroup> getGroup(@PathVariable Long id) {
        return deliveryGroupService.getGroup(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 배차 그룹 등록 또는 수정
     */
    @PostMapping
    public ResponseEntity<DeliveryGroup> createOrUpdateGroup(@RequestBody DeliveryGroup group) {
        return ResponseEntity.ok(deliveryGroupService.saveGroup(group));
    }

    /**
     * 배차 그룹 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        deliveryGroupService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }
}
