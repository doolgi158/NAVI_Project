package com.navi.bag.repository;

import com.navi.bag.domain.DeliveryReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryReservationRepository extends JpaRepository<DeliveryReservation, Long> {
}
