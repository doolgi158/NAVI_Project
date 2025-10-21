package com.navi.delivery.admin.service;

import com.navi.delivery.admin.dto.AdminDeliveryGroupDTO;

import java.util.List;

public interface AdminDeliveryGroupService {

    // ✅ 전체 그룹 조회 (예약 수 포함)
    List<AdminDeliveryGroupDTO> getAllGroups();

    // ✅ 상태 변경 (READY → IN_PROGRESS / DONE 등)
    AdminDeliveryGroupDTO updateGroupStatus(String id, String newStatus);
}
