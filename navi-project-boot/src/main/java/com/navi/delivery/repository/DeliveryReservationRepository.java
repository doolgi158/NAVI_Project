package com.navi.delivery.repository;

import com.navi.delivery.domain.DeliveryReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryReservationRepository extends JpaRepository<DeliveryReservation, Long> {
}
