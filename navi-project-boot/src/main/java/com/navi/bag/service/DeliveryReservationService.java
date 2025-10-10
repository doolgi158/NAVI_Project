package com.navi.bag.service;

import com.navi.bag.domain.DeliveryReservation;
import java.util.List;
import java.util.Optional;

/**
 * 짐배송 예약 상세 관리 서비스 인터페이스
 * - 예약 등록, 조회, 삭제 기능 정의
 */
public interface DeliveryReservationService {

    // 전체 예약 조회
    List<DeliveryReservation> getAllReservations();

    // 단일 예약 조회
    Optional<DeliveryReservation> getReservation(Long id);

    // 예약 등록 또는 수정
    DeliveryReservation saveReservation(DeliveryReservation reservation);

    // 예약 삭제
    void deleteReservation(Long id);
}
