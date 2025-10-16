package com.navi.delivery.service;

import com.navi.delivery.domain.DeliveryGroup;

import java.util.List;
import java.util.Optional;

public interface DeliveryGroupService {

    List<DeliveryGroup> getAllGroups();

    Optional<DeliveryGroup> getGroup(String id);

    DeliveryGroup saveGroup(DeliveryGroup group);

    void deleteGroup(String id);
}
