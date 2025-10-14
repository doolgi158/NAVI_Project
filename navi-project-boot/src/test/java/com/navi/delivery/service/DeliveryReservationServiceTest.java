//package com.navi.delivery.service;
//
//import com.navi.delivery.domain.Bag;
//import com.navi.delivery.domain.Delivery;
//import com.navi.delivery.domain.DeliveryGroup;
//import com.navi.delivery.domain.DeliveryReservation;
//import com.navi.delivery.repository.BagRepository;
//import com.navi.delivery.repository.DeliveryGroupRepository;
//import com.navi.delivery.repository.DeliveryRepository;
//import com.navi.delivery.repository.DeliveryReservationRepository;
//import lombok.extern.slf4j.Slf4j;
//import org.junit.jupiter.api.Assertions;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.test.annotation.Commit;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDate;
//
///**
// * 짐배송 예약 서비스 통합 테스트
// * - 요금 자동 계산 및 배송 상태 변경 검증
// * - DB 커밋 버전 (rollback X)
// */
//@Slf4j
//@SpringBootTest
//@Transactional
//@Commit // ✅ 테스트 종료 후 실제 DB 커밋
//class DeliveryReservationServiceTest {
//
//    @Autowired
//    private DeliveryReservationService deliveryReservationService;
//
//    @Autowired
//    private DeliveryReservationRepository deliveryReservationRepository;
//
//    @Autowired
//    private DeliveryRepository deliveryRepository;
//
//    @Autowired
//    private DeliveryGroupRepository deliveryGroupRepository;
//
//    @Autowired
//    private BagRepository bagRepository;
//
//    @Test
//    @DisplayName("예약 생성 시 요금 자동 계산 및 배송 상태 변경 검증 (DB 커밋)")
//    void testSaveReservationAutoPriceAndStatusUpdate() {
//        log.info("===== 짐배송 예약 통합 테스트 시작 =====");
//
//        // 1️⃣ 테스트용 가방 데이터 저장
//        Bag bag = Bag.builder()
//                .bagSize("L")
//                .maxWeight(30)
//                .basePrice(25000)
//                .build();
//        bagRepository.save(bag);
//        log.info("✅ 가방 저장 완료: {} / 기본요금: {}", bag.getBagSize(), bag.getBasePrice());
//
//        // 2️⃣ 테스트용 그룹 데이터 저장
//        DeliveryGroup group = DeliveryGroup.builder()
//                .groupName("제주시_10AM_1")
//                .groupDate(LocalDate.now())
//                .region("제주시")
//                .status("IN_PROGRESS")
//                .build();
//        deliveryGroupRepository.save(group);
//        log.info("✅ 배차 그룹 저장 완료: {}", group.getGroupName());
//
//        // 3️⃣ 테스트용 배송 데이터 저장
//        Delivery delivery = Delivery.builder()
//                .userId(1L)
//                .deliveryGroup(group)
//                .fromAddr("제주공항")
//                .toAddr("해비치호텔")
//                .deliveryDate(LocalDate.now())
//                .status("INPUT")
//                .build();
//        deliveryRepository.save(delivery);
//        log.info("✅ 배송 데이터 저장 완료: 배송ID={}, 상태={}", delivery.getDeliveryId(), delivery.getStatus());
//
//        // 4️⃣ 예약 생성 (서비스 호출)
//        DeliveryReservation reservation = DeliveryReservation.builder()
//                .delivery(delivery)
//                .bag(bag)
//                .bagQty(2)
//                .memo("프런트에 맡겨주세요")
//                .build();
//
//        DeliveryReservation saved = deliveryReservationService.saveReservation(reservation);
//        log.info("✅ 예약 저장 완료: 예약ID={}, 총요금={}", saved.getRsvId(), saved.getTotalPrice());
//
//        // 5️⃣ 검증
//        Assertions.assertEquals(50000, saved.getTotalPrice());
//        Assertions.assertEquals("READY", saved.getDelivery().getStatus());
//
//        log.info("💰 요금 계산 결과: {} × {} = {}", bag.getBasePrice(), reservation.getBagQty(), saved.getTotalPrice());
//        log.info("📦 배송 상태 변경 결과: {}", saved.getDelivery().getStatus());
//        log.info("===== 짐배송 예약 통합 테스트 완료 — DB 커밋됨 =====");
//    }
//}
