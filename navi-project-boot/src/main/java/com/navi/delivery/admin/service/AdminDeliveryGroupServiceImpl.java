package com.navi.delivery.admin.service.impl;

import com.navi.common.enums.RsvStatus;
import com.navi.delivery.admin.dto.AdminDeliveryGroupDTO;
import com.navi.delivery.admin.service.AdminDeliveryGroupService;
import com.navi.delivery.domain.DeliveryGroup;
import com.navi.delivery.domain.DeliveryReservation;
import com.navi.delivery.repository.DeliveryGroupRepository;
import com.navi.delivery.repository.DeliveryReservationRepository;
import jakarta.transaction.Transactional;
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
    @Transactional
    public AdminDeliveryGroupDTO updateGroupStatus(String id, String newStatus) {
        log.info("[ADMIN] 배송 그룹 상태 변경 요청: id={}, newStatus={}", id, newStatus);

        DeliveryGroup group = deliveryGroupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Group not found. ID=" + id));

        List<DeliveryReservation> reservations = deliveryReservationRepository.findByGroup_GroupId(id);

        // ✅ 상태 변경 가능 여부 검증
        validateStatusChange(group.getStatus(), newStatus, reservations);

        // 1) 그룹 상태 변경
        group.setStatus(newStatus);
        DeliveryGroup updated = deliveryGroupRepository.save(group);

        // 2) 그룹 내 예약 상태 동기화
        RsvStatus target = mapGroupToReservationStatus(newStatus);
        for (DeliveryReservation r : reservations) {
            r.setStatus(target);
        }
        deliveryReservationRepository.saveAll(reservations);

        int count = reservations.size();
        log.info("[ADMIN] 그룹 상태 동기화 완료: groupId={}, groupStatus={}, reservationStatus={}, affected={}",
                updated.getGroupId(), newStatus, target, count);

        return AdminDeliveryGroupDTO.fromEntity(updated, count);
    }

    /**
     * ✅ 상태 변경 조건 강화 로직
     */
    private void validateStatusChange(String currentStatus, String newStatus, List<DeliveryReservation> reservations) {
        log.info("[ADMIN] 상태 변경 검증: {} → {}", currentStatus, newStatus);

        // 1) READY → IN_PROGRESS
        if ("READY".equalsIgnoreCase(currentStatus) && "IN_PROGRESS".equalsIgnoreCase(newStatus)) {
            boolean allPaid = reservations.stream().allMatch(r -> r.getStatus() == RsvStatus.PAID);
            if (!allPaid) {
                throw new IllegalStateException("결제 완료(PAID)되지 않은 예약이 포함되어 있습니다. 배송을 시작할 수 없습니다.");
            }
        }

        // 2) IN_PROGRESS → COMPLETED
        if ("IN_PROGRESS".equalsIgnoreCase(currentStatus) && "COMPLETED".equalsIgnoreCase(newStatus)) {
            boolean allDone = reservations.stream()
                    .allMatch(r -> r.getStatus() == RsvStatus.PAID || r.getStatus() == RsvStatus.COMPLETE);
            if (!allDone) {
                throw new IllegalStateException("배송 중 혹은 완료되지 않은 예약이 있습니다. 그룹을 완료로 변경할 수 없습니다.");
            }
        }

        // 3) COMPLETED → READY (재오픈 허용)
        if ("COMPLETED".equalsIgnoreCase(currentStatus) && "READY".equalsIgnoreCase(newStatus)) {
            log.info("[ADMIN] COMPLETED → READY 상태는 강제 초기화 허용");
            return;
        }
    }

    /**
     * ✅ 그룹 상태 → 예약 상태 매핑
     */
    private RsvStatus mapGroupToReservationStatus(String groupStatus) {
        if ("COMPLETED".equalsIgnoreCase(groupStatus)) return RsvStatus.COMPLETE;
        if ("IN_PROGRESS".equalsIgnoreCase(groupStatus)) return RsvStatus.PAID;
        return RsvStatus.PENDING; // READY
    }

}
