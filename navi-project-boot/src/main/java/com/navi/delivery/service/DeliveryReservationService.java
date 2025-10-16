package com.navi.delivery.service;

import com.navi.delivery.dto.DeliveryReservationDTO;
import com.navi.delivery.domain.DeliveryReservation;
import java.util.List;

public interface DeliveryReservationService {

    /** 배송 예약 등록 */
    DeliveryReservation createReservation(DeliveryReservationDTO dto);

    /** 특정 사용자 예약 목록 조회 */
    List<DeliveryReservation> getReservationsByUser(Long userNo);

    /** 단일 예약 상세 조회 */
    DeliveryReservation getReservationById(String drsvId);

    /** 예약 상태 업데이트 (결제 완료 등) */
    DeliveryReservation updateStatus(String drsvId, String status);
}
