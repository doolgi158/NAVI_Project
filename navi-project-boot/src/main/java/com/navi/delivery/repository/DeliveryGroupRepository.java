package com.navi.delivery.repository;

import com.navi.delivery.domain.DeliveryGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DeliveryGroupRepository extends JpaRepository<DeliveryGroup, String> {
    Optional<DeliveryGroup> findByRegionAndDeliveryDateAndTimeSlot(String region, LocalDate deliveryDate, String timeSlot);

    List<DeliveryGroup> findByDeliveryDateBefore(LocalDate date);

}
