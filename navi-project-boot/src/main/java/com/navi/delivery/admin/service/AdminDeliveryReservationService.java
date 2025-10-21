package com.navi.delivery.admin.service;

import com.navi.delivery.admin.dto.AdminDeliveryReservationDTO;
import java.util.List;

public interface AdminDeliveryReservationService {

    List<AdminDeliveryReservationDTO> getAllReservations();

    AdminDeliveryReservationDTO getReservation(String drsvId);

    AdminDeliveryReservationDTO createReservation(AdminDeliveryReservationDTO dto);

    AdminDeliveryReservationDTO updateReservation(String drsvId, AdminDeliveryReservationDTO dto);

    void deleteReservation(String drsvId);
}
