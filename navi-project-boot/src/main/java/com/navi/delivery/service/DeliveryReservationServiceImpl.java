package com.navi.delivery.service;

import com.navi.delivery.domain.Bag;
import com.navi.delivery.domain.Delivery;
import com.navi.delivery.domain.DeliveryReservation;
import com.navi.delivery.repository.BagRepository;
import com.navi.delivery.repository.DeliveryRepository;
import com.navi.delivery.repository.DeliveryReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 짐배송 예약 상세 관리 서비스 구현체
 * - 요금 계산 및 배송 상태 자동 변경 포함
 */
@Service
@RequiredArgsConstructor
public class DeliveryReservationServiceImpl implements DeliveryReservationService {

    private final DeliveryReservationRepository deliveryReservationRepository;
    private final BagRepository bagRepository;
    private final DeliveryRepository deliveryRepository;

    /**
     * 전체 예약 조회
     */
    @Override
    public List<DeliveryReservation> getAllReservations() {
        return deliveryReservationRepository.findAll();
    }

    /**
     * 단일 예약 조회
     */
    @Override
    public Optional<DeliveryReservation> getReservation(Long id) {
        return deliveryReservationRepository.findById(id);
    }

    /**
     * 예약 등록 또는 수정
     * - 총 요금 자동 계산 (bagQty × bag.basePrice)
     * - 결제 완료 시 배송 상태를 READY 로 변경
     */
    @Override
    @Transactional
    public DeliveryReservation saveReservation(DeliveryReservation reservation) {
        // 1. 가방 요금 조회
        Bag bag = bagRepository.findById(reservation.getBag().getBagSize())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 가방 타입입니다."));

        // 2. 총 요금 계산
        int totalPrice = bag.getBasePrice() * reservation.getBagQty();
        reservation.setTotalPrice(totalPrice);

        // 3. 배송 상태 업데이트 (결제 완료 시 READY 상태로)
        Delivery delivery = reservation.getDelivery();
        if (delivery != null) {
            delivery.setStatus("READY");
            deliveryRepository.save(delivery);
        }

        // 4. 예약 저장
        return deliveryReservationRepository.save(reservation);
    }

    /**
     * 예약 삭제
     */
    @Override
    public void deleteReservation(Long id) {
        deliveryReservationRepository.deleteById(id);
    }
}
