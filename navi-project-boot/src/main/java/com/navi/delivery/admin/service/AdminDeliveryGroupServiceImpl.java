package com.navi.delivery.admin.service.impl;

import com.navi.delivery.admin.dto.AdminDeliveryGroupDTO;
import com.navi.delivery.admin.service.AdminDeliveryGroupService;
import com.navi.delivery.domain.DeliveryGroup;
import com.navi.delivery.repository.DeliveryGroupRepository;
import com.navi.delivery.repository.DeliveryReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDeliveryGroupServiceImpl implements AdminDeliveryGroupService {

    private final DeliveryGroupRepository deliveryGroupRepository;
    private final DeliveryReservationRepository deliveryReservationRepository;

    @Override
    public List<AdminDeliveryGroupDTO> getAllGroups() {
        log.info("[ADMIN] 배송 그룹 전체 조회 요청");
        List<DeliveryGroup> groups = deliveryGroupRepository.findAll();

        return groups.stream()
                .map(group -> {
                    int count = deliveryReservationRepository.countByGroup_GroupId(group.getGroupId());
                    return AdminDeliveryGroupDTO.fromEntity(group, count);
                })
                .collect(Collectors.toList());
    }

    @Override
    public AdminDeliveryGroupDTO updateGroupStatus(String id, String Status) {
        log.info("[ADMIN] 배송 그룹 상태 변경 요청: id={}, Status={}", id, Status);

        DeliveryGroup group = deliveryGroupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Group not found. ID=" + id));

        group.setStatus(Status);
        DeliveryGroup updated = deliveryGroupRepository.save(group);

        int count = deliveryReservationRepository.countByGroup_GroupId(updated.getGroupId());
        return AdminDeliveryGroupDTO.fromEntity(updated, count);
    }
}
