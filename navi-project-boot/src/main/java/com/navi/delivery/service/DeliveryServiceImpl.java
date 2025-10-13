package com.navi.delivery.service;

import com.navi.delivery.domain.Delivery;
import com.navi.delivery.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * 짐배송 요청 관리 서비스 구현체
 * - CRUD 기능 처리
 */
@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;

    /**
     * 전체 배송 요청 조회
     */
    @Override
    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    /**
     * 단일 배송 요청 조회
     */
    @Override
    public Optional<Delivery> getDelivery(Long id) {
        return deliveryRepository.findById(id);
    }

    /**
     * 배송 요청 등록 또는 수정
     */
    @Override
    public Delivery saveDelivery(Delivery delivery) {
        return deliveryRepository.save(delivery);
    }

    /**
     * 배송 요청 삭제
     */
    @Override
    public void deleteDelivery(Long id) {
        deliveryRepository.deleteById(id);
    }
}
