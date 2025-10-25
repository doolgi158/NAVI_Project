package com.navi.delivery.config;

import com.navi.delivery.domain.DeliveryGroup;
import com.navi.delivery.domain.DeliveryReservation;
import com.navi.delivery.repository.DeliveryGroupRepository;
import com.navi.delivery.repository.DeliveryReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeliveryGroupStatusScheduler {

    private final DeliveryGroupRepository groupRepository;
    private final DeliveryReservationRepository reservationRepository;

    /**
     * ✅ 매일 새벽 00:10에 지난 날짜 그룹 자동 완료 처리
     */
    @Transactional
    @Scheduled(cron = "0 10 0 * * *", zone = "Asia/Seoul")
    public void autoCompleteOldGroups() {
        LocalDate today = LocalDate.now();
        log.info("[Scheduler] 그룹 상태 자동 갱신 시작 - 기준일: {}", today);

        // 1️⃣ 오늘 이전 날짜 그룹 조회
        List<DeliveryGroup> oldGroups = groupRepository.findByDeliveryDateBefore(today);

        for (DeliveryGroup group : oldGroups) {
            // 이미 완료된 그룹은 스킵
            if ("COMPLETED".equals(group.getStatus())) continue;

            group.setStatus("COMPLETED");
            groupRepository.save(group);

            // 2️⃣ 그룹 내 예약도 함께 COMPLETED 처리
            List<DeliveryReservation> reservations = reservationRepository.findByGroup_GroupId(group.getGroupId());
            for (DeliveryReservation r : reservations) {
                r.setStatus(com.navi.common.enums.RsvStatus.COMPLETE);
                reservationRepository.save(r);
            }

            log.info("[Scheduler] 그룹 자동 완료 처리됨 → groupId={}, date={}", group.getGroupId(), group.getDeliveryDate());
        }
    }
}
