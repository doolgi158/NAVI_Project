package com.navi.delivery.controller;

import com.navi.delivery.domain.DeliveryGroup;
import com.navi.delivery.service.DeliveryGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 배차 그룹 관리 컨트롤러
 * - 그룹 조회 / 추가 / 수정 / 삭제
 */
@RestController
@RequestMapping("/api/delivery/group")
@RequiredArgsConstructor
public class DeliveryGroupController {

    private final DeliveryGroupService deliveryGroupService;

    /**
     * 모든 배차 그룹 조회
     */
    @GetMapping
    public ResponseEntity<List<DeliveryGroup>> getAllGroups() {
        return ResponseEntity.ok(deliveryGroupService.getAllGroups());
    }

    /**
     * 특정 그룹 조회
     */
    @GetMapping("/{groupId}")
    public ResponseEntity<DeliveryGroup> getGroup(@PathVariable String groupId) {
        return deliveryGroupService.getGroup(groupId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 그룹 생성/수정
     */
    @PostMapping
    public ResponseEntity<DeliveryGroup> saveGroup(@RequestBody DeliveryGroup group) {
        return ResponseEntity.ok(deliveryGroupService.saveGroup(group));
    }

    /**
     * 그룹 삭제
     */
    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable String groupId) {
        deliveryGroupService.deleteGroup(groupId);
        return ResponseEntity.noContent().build();
    }
}
