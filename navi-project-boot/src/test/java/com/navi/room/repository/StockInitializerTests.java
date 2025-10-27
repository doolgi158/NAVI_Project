package com.navi.room.repository;

import com.navi.room.domain.Room;
import com.navi.room.domain.RoomStock;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@SpringBootTest
public class StockInitializerTests {
    @Autowired private RoomRepository roomRepository;
    @Autowired private StockRepository stockRepository;

    @Test
    void initRoomStockData() {
        log.info("=== 테스트 환경에서 RoomStock 초기 데이터 생성 시작 ===");

        List<Room> rooms = roomRepository.findValidRooms();
        log.info("🏨 유효한 객실 수: {}", rooms.size());

        LocalDate today = LocalDate.now();
        int createdCount = 0;

        // 14일치만 생성 (오늘 포함)
        for (Room room : rooms) {
            if (room.getRoomCnt() <= 0) {
                log.warn("🚫 객실수 0인 Room 제외: {}", room.getRoomName());
                continue;
            }
            for (int i = 0; i < 14; i++) {
                LocalDate targetDate = today.plusDays(i);

                if (!stockRepository.existsByRoomAndStockDate(room, targetDate)) {
                    RoomStock stock = RoomStock.builder()
                            .room(room)
                            .stockDate(targetDate)
                            .remainCount(room.getRoomCnt())
                            .isAvailable(true)
                            .build();

                    stockRepository.save(stock);
                    createdCount++;
                }
            }
        }

        log.info("✅ 테스트 환경 초기화 완료: {}건 생성 ({} rooms × 7 days)", createdCount, rooms.size());
    }
}
