package com.navi.delivery.service;

import com.navi.delivery.domain.DeliveryGroup;
import com.navi.delivery.repository.DeliveryGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * 배차 그룹 관리 서비스 구현체
 * - CRUD 기능 처리
 */
@Service
@RequiredArgsConstructor
public class DeliveryGroupServiceImpl implements DeliveryGroupService {

    private final DeliveryGroupRepository deliveryGroupRepository;

    @Override
    public List<DeliveryGroup> getAllGroups() {
        return deliveryGroupRepository.findAll();
    }

    @Override
    public Optional<DeliveryGroup> getGroup(Long id) {
        return deliveryGroupRepository.findById(id);
    }

    @Override
    public DeliveryGroup saveGroup(DeliveryGroup group) {
        return deliveryGroupRepository.save(group);
    }

    @Override
    public void deleteGroup(Long id) {
        deliveryGroupRepository.deleteById(id);
    }
}
