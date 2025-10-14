package com.navi.delivery.repository;

import com.navi.delivery.domain.DeliveryReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryReservationRepository extends JpaRepository<DeliveryReservation, String> {
    List<DeliveryReservation> findByUser_No(Long userNo);
}
