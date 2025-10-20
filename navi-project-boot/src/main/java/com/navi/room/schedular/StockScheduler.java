package com.navi.room.schedular;

import com.navi.room.domain.Room;
import com.navi.room.domain.RoomStock;
import com.navi.room.repository.RoomRepository;
import com.navi.room.repository.StockRepository;
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
public class StockScheduler {

    private final RoomRepository roomRepository;
    private final StockRepository stockRepository;

    /**
     * 매일 자정마다 실행 (과거 재고 삭제 + 신규 재고 생성)
     */
    @Scheduled(cron = "0 0 0 * * *")  // 매일 00:00
    @Transactional
    public void rollRoomStock() {
        LocalDate today = LocalDate.now();

        // 1️⃣ 지난 재고 삭제
        int deleted = stockRepository.deleteAllByStockDateBefore(today);
        log.info("🧹 지난 재고 {}건 삭제 완료 ({} 이전)", deleted, today);

        // 2️⃣ 신규 재고 생성 (오늘 기준 +29일 → 항상 30일 유지)
        LocalDate newDate = today.plusDays(29);

        // ✅ 0원 또는 0개 객실 제외된 유효한 Room만 조회
        List<Room> rooms = roomRepository.findValidRooms();
        log.info("🏨 유효한 객실 수: {}", rooms.size());

        int created = 0;
        for (Room room : rooms) {
            if (room.getRoomCnt() <= 0) {
                log.warn("🚫 객실수 0인 Room 제외: {}", room.getRoomName());
                continue;
            }
            boolean exists = stockRepository.existsByRoomAndStockDate(room, newDate);
            if (!exists) {
                RoomStock newStock = RoomStock.builder()
                        .room(room)
                        .stockDate(newDate)
                        .remainCount(room.getRoomCnt())
                        .isAvailable(true)
                        .build();
                stockRepository.save(newStock);
                created++;
            }
        }

        log.info("✅ 신규 재고 {}건 생성 완료 (날짜={})", created, newDate);
    }
}
