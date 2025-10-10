package com.navi.bag.service;

import com.navi.bag.domain.Delivery;
import java.util.List;
import java.util.Optional;

/**
 * 짐배송 요청 관리 서비스 인터페이스
 * - 배송 등록, 조회, 삭제 기능 정의
 */
public interface DeliveryService {

    // 전체 배송 요청 조회
    List<Delivery> getAllDeliveries();

    // 단일 배송 요청 조회
    Optional<Delivery> getDelivery(Long id);

    // 배송 요청 등록 또는 수정
    Delivery saveDelivery(Delivery delivery);

    // 배송 요청 삭제
    void deleteDelivery(Long id);
}
