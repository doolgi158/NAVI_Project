package com.navi.room.schedular;

import com.navi.common.enums.RsvStatus;
import com.navi.room.domain.RoomRsv;
import com.navi.room.repository.RoomRsvRepository;
import com.navi.room.service.StockService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class StockTimeoutScheduler {
    private final RoomRsvRepository roomRsvRepository;
    private final StockService stockService;


    @Scheduled(initialDelay = 600000, fixedRate = 600000) // (1분 마다 실행)
    @Transactional
    public void cancelExpiredReservations() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.minusMinutes(5); // 5분 이전에 생성된 예약 취소

        // [1] 5분 이상 경과한 PENDING 예약 조회
        List<RoomRsv> expiredList = roomRsvRepository.findExpiredReservations(RsvStatus.PENDING, threshold);

        if (expiredList.isEmpty()) return;

        for (RoomRsv rsv : expiredList) {
            try {
                stockService.increaseStock(
                        rsv.getRoom(),
                        rsv.getStartDate(),
                        rsv.getEndDate(),
                        rsv.getQuantity()
                );
                rsv.markCancelled();
                roomRsvRepository.save(rsv);

                log.info("⏰ [AUTO-CANCEL] 예약 자동 취소 완료 → reserveId={}, room={}, 기간={}~{}",
                        rsv.getReserveId(), rsv.getRoom().getRoomId(),
                        rsv.getStartDate(), rsv.getEndDate());
            } catch (Exception e) {
                log.error("❌ 예약 자동 취소 실패 → reserveId={}, 이유={}", rsv.getReserveId(), e.getMessage(), e);
            }
        }

        log.info("✅ 자동 취소 완료: {}건 (기준: {} 이전)", expiredList.size(), threshold);
    }
}
