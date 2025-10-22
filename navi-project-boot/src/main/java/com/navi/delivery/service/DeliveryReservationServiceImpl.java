package com.navi.delivery.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.common.enums.RsvStatus;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryReservationServiceImpl implements DeliveryReservationService {

    private final DeliveryReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final BagRepository bagRepository;
    private final DeliveryGroupRepository groupRepository;

    @Override
    @Transactional
    public DeliveryReservation createReservation(DeliveryReservationDTO dto) {

        // 1. 사용자 검증
        User user = userRepository.findById(dto.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userNo=" + dto.getUserNo()));

        // 2. 예약번호 생성
        String drsvId = generateDrsvId();

        // 3. 상태 기본값
        RsvStatus status = dto.getStatus() != null ? dto.getStatus() : RsvStatus.PENDING;

        // 4. 지역 추출
        String region = dto.getStartAddr().contains("서귀포") ? "서귀포시" : "제주시";

        // 5. 그룹 자동 배정 또는 신규 생성
        DeliveryGroup group = groupRepository
                .findByRegionAndDeliveryDateAndTimeSlot(region, dto.getDeliveryDate(), "오전")
                .orElseGet(() -> {
                    String groupId = generateGroupId(region, dto.getDeliveryDate(), "오전");
                    DeliveryGroup newGroup = DeliveryGroup.builder()
                            .groupId(groupId)
                            .region(region)
                            .deliveryDate(dto.getDeliveryDate())
                            .timeSlot("오전")
                            .status("READY")
                            .build();
                    return groupRepository.save(newGroup);
                });

        // 6. ✅ 가방 JSON 변환
        String bagsJson = null;
        if (dto.getBags() != null && !dto.getBags().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                bagsJson = mapper.writeValueAsString(dto.getBags());
            } catch (Exception e) {
                throw new RuntimeException("가방 정보 JSON 변환 실패", e);
            }
        }

        // 7. 금액 설정
        BigDecimal totalPrice = dto.getTotalPrice() != null ? dto.getTotalPrice() : BigDecimal.ZERO;

        // 8. 예약 엔티티 생성
        DeliveryReservation reservation = DeliveryReservation.builder()
                .drsvId(drsvId)
                .user(user)
                .group(group)
                .startAddr(dto.getStartAddr())
                .endAddr(dto.getEndAddr())
                .deliveryDate(dto.getDeliveryDate())
                .totalPrice(totalPrice)
                .bagsJson(bagsJson) // ✅ 여기 추가됨
                .status(status)
                .build();

        DeliveryReservation saved = reservationRepository.save(reservation);

        log.info("[짐배송 예약 완료] drsvId={}, totalPrice={}, region={}, group={}, bags={}",
                saved.getDrsvId(), saved.getTotalPrice(), region, group.getGroupId(), bagsJson);

        return saved;
    }

    @Override
    public List<DeliveryReservation> getReservationsByUser(Long userNo) {
        return reservationRepository.findByUser_No(userNo);
    }

    @Override
    public DeliveryReservation getReservationById(String drsvId) {
        return reservationRepository.findById(drsvId)
                .orElseThrow(() -> new IllegalArgumentException("예약 정보를 찾을 수 없습니다. drsvId=" + drsvId));
    }

    @Override
    @Transactional
    public DeliveryReservation updateStatus(String drsvId, String status) {
        DeliveryReservation reservation = getReservationById(drsvId);
        try {
            RsvStatus newStatus = RsvStatus.valueOf(status.toUpperCase());
            reservation.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("잘못된 상태 값입니다. 허용값: PENDING, PAID, CANCELLED, REFUNDED, FAILED, COMPLETED");
        }
        return reservationRepository.save(reservation);
    }

    private String generateDrsvId() {
        LocalDate today = LocalDate.now();
        long countToday = reservationRepository.countByCreatedAtBetween(
                today.atStartOfDay(),
                today.plusDays(1).atStartOfDay()
        );
        return String.format("%sDLV%04d",
                today.format(DateTimeFormatter.BASIC_ISO_DATE),
                countToday + 1
        );
    }

    private String generateGroupId(String region, LocalDate date, String timeSlot) {
        String regionKey = region.contains("서귀포") ? "SGP" : "JEJU";
        String slotKey = timeSlot.equals("오전") ? "AM" : "PM";
        long groupCount = groupRepository.count();
        return String.format("G%s_%s_%s_%d",
                date.format(DateTimeFormatter.BASIC_ISO_DATE),
                regionKey, slotKey, groupCount + 1
        );
    }
}
