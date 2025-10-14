package com.navi.delivery.service;

import com.navi.delivery.domain.Bag;
import com.navi.delivery.domain.DeliveryGroup;
import com.navi.delivery.domain.DeliveryReservation;
import com.navi.delivery.dto.DeliveryReservationDTO;
import com.navi.delivery.repository.BagRepository;
import com.navi.delivery.repository.DeliveryGroupRepository;
import com.navi.delivery.repository.DeliveryReservationRepository;
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DeliveryReservationServiceImpl implements DeliveryReservationService {

    private final DeliveryReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final BagRepository bagRepository;
    private final DeliveryGroupRepository groupRepository;

    /**
     * 짐배송 예약 등록 (그룹 자동 생성)
     */
    @Override
    @Transactional
    public DeliveryReservation createReservation(DeliveryReservationDTO dto) {
        // 1️⃣ 사용자 조회
        User user = userRepository.findById(dto.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2️⃣ 가방 정보 조회
        Bag bag = bagRepository.findById(dto.getBagId())
                .orElseThrow(() -> new IllegalArgumentException("가방 정보를 찾을 수 없습니다."));

        // 3️⃣ 주소 기반 지역 추출
        String region = dto.getEndAddr().contains("서귀포") ? "서귀포시" : "제주시";

        // 4️⃣ 그룹 자동 생성 or 조회
        LocalDate deliveryDate = dto.getDeliveryDate();
        String timeSlot = "오전"; // 기본값

        DeliveryGroup group = groupRepository
                .findByRegionAndDeliveryDateAndTimeSlot(region, deliveryDate, timeSlot)
                .orElseGet(() -> {
                    String groupId = String.format("G%s_%s_%s",
                            deliveryDate.format(DateTimeFormatter.BASIC_ISO_DATE),
                            region,
                            timeSlot.equals("오전") ? "AM" : "PM"
                    );
                    DeliveryGroup newGroup = DeliveryGroup.builder()
                            .groupId(groupId)
                            .region(region)
                            .deliveryDate(deliveryDate)
                            .timeSlot(timeSlot)
                            .status("READY")
                            .build();
                    return groupRepository.save(newGroup);
                });

        // 5️⃣ 예약 ID 생성 (예: 20251014DVL0001)
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        long count = reservationRepository.count();
        String drsvId = String.format("%sDVL%04d", datePart, count + 1);

        // 6️⃣ 예약 생성
        DeliveryReservation reservation = DeliveryReservation.builder()
                .drsvId(drsvId)
                .user(user)
                .bag(bag)
                .group(group)
                .startAddr(dto.getStartAddr())
                .endAddr(dto.getEndAddr())
                .deliveryDate(deliveryDate)
                .totalPrice(Optional.ofNullable(dto.getTotalPrice()).orElse(BigDecimal.ZERO))
                .status("PENDING")
                .build();

        // 7️⃣ 저장 및 반환
        return reservationRepository.save(reservation);
    }

    /**
     * 특정 사용자 예약 목록 조회
     */
    @Override
    public List<DeliveryReservation> getReservationsByUser(Long userNo) {
        return reservationRepository.findByUser_No(userNo);
    }

    /**
     * 단일 예약 상세 조회
     */
    @Override
    public DeliveryReservation getReservationById(String drsvId) {
        return reservationRepository.findById(drsvId)
                .orElseThrow(() -> new IllegalArgumentException("해당 예약을 찾을 수 없습니다."));
    }

    /**
     * 예약 상태 업데이트 (결제 완료 등)
     */
    @Override
    @Transactional
    public DeliveryReservation updateStatus(String drsvId, String status) {
        DeliveryReservation reservation = reservationRepository.findById(drsvId)
                .orElseThrow(() -> new IllegalArgumentException("해당 예약을 찾을 수 없습니다."));

        reservation.setStatus(status);
        return reservationRepository.save(reservation);
    }
}
