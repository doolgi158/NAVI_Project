package com.navi.delivery.service;

import com.navi.common.enums.RsvStatus;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryReservationServiceImpl implements DeliveryReservationService {

    private final DeliveryReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final BagRepository bagRepository;
    private final DeliveryGroupRepository groupRepository;

    /** 1. 짐배송 예약 생성 (자동 그룹 배정 포함) */
    @Override
    @Transactional
    public DeliveryReservation createReservation(DeliveryReservationDTO dto) {

        // 1. 사용자 검증
        User user = userRepository.findById(dto.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userNo=" + dto.getUserNo()));

        // 2. 가방 검증
        Bag bag = bagRepository.findById(dto.getBagId())
                .orElseThrow(() -> new IllegalArgumentException("가방 정보를 찾을 수 없습니다. bagId=" + dto.getBagId()));

        // 3. 예약번호 생성
        String drsvId = generateDrsvId();

        // 4. 상태 기본값 설정
        RsvStatus status = dto.getStatus() != null ? dto.getStatus() : RsvStatus.PENDING;

        // 5. 금액 계산
        BigDecimal totalPrice = (dto.getTotalPrice() != null)
                ? dto.getTotalPrice()
                : BigDecimal.valueOf(bag.getPrice());

        // 6. 지역 추출
        String region = dto.getStartAddr().contains("서귀포") ? "서귀포시" : "제주시";

        // 7. 그룹 자동 배정 또는 신규 생성
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

        // 8. 예약 엔티티 생성
        DeliveryReservation reservation = DeliveryReservation.builder()
                .drsvId(drsvId)
                .user(user)
                .bag(bag)
                .group(group)
                .startAddr(dto.getStartAddr())
                .endAddr(dto.getEndAddr())
                .deliveryDate(dto.getDeliveryDate())
                .totalPrice(totalPrice)
                .status(status)
                .build();

        DeliveryReservation saved = reservationRepository.save(reservation);

        log.info("[짐배송 예약 완료] drsvId={}, region={}, date={}, groupId={}, status={}",
                saved.getDrsvId(), region, saved.getDeliveryDate(), group.getGroupId(), saved.getStatus());

        return saved;
    }

    /** 2. 사용자별 예약 조회 */
    @Override
    public List<DeliveryReservation> getReservationsByUser(Long userNo) {
        return reservationRepository.findByUser_No(userNo);
    }

    /** 3. 단일 예약 조회 */
    @Override
    public DeliveryReservation getReservationById(String drsvId) {
        return reservationRepository.findById(drsvId)
                .orElseThrow(() -> new IllegalArgumentException("예약 정보를 찾을 수 없습니다. drsvId=" + drsvId));
    }

    /** 4. 예약 상태 변경 */
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

    /** 예약번호 생성 (예: 20251017DVL0001) */
    private String generateDrsvId() {
        LocalDate today = LocalDate.now();
        long countToday = reservationRepository.countByCreatedAtBetween(
                today.atStartOfDay(),
                today.plusDays(1).atStartOfDay()
        );
        return String.format("%sDVL%04d",
                today.format(DateTimeFormatter.BASIC_ISO_DATE),
                countToday + 1
        );
    }

    /** 그룹 ID 생성 (예: G20251017_JEJU_AM_1) */
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
