package com.navi.delivery.repository;

import com.navi.delivery.domain.DeliveryGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryGroupRepository extends JpaRepository<DeliveryGroup, Long> {
}
