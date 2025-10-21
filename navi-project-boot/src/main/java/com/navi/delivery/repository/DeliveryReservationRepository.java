package com.navi.delivery.repository;

import com.navi.delivery.domain.DeliveryReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface DeliveryReservationRepository extends JpaRepository<DeliveryReservation, String> {

    // 사용자별 예약 조회
    List<DeliveryReservation> findByUser_No(Long userNo);

    // 생성일 기준으로 오늘 예약 수 카운트 (예약번호 생성용)
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    int countByGroup_GroupId(String groupId);
}
