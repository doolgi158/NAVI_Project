package com.navi.delivery.admin.controller;

import com.navi.delivery.admin.dto.AdminDeliveryGroupDTO;
import com.navi.delivery.admin.service.AdminDeliveryGroupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/deliveries/groups")
public class AdminDeliveryGroupController {

    private final AdminDeliveryGroupService adminDeliveryGroupService;

    /**
     * ✅ 전체 그룹 조회
     */
    @GetMapping
    public List<AdminDeliveryGroupDTO> getAllGroups() {
        return adminDeliveryGroupService.getAllGroups();
    }

    /**
     * ✅ 그룹 상태 변경
     */
    @PutMapping("/{id}/status")
    public AdminDeliveryGroupDTO updateGroupStatus(
            @PathVariable String id,
            @RequestParam("status") String Status
    ) {
        return adminDeliveryGroupService.updateGroupStatus(id, Status);
    }
}
