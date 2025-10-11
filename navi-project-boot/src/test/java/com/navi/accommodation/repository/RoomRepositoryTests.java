package com.navi.accommodation.repository;

import com.navi.accommodation.service.RoomService;
import com.navi.accommodation.service.RoomSyncService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Slf4j
public class RoomRepositoryTests {
    @Autowired private RoomService roomService;
    @Autowired private RoomSyncService roomSyncService;

    @Test
    public void loadRoomData() throws Exception {
        roomSyncService.loadFromJsonFile();
        log.info("API 데이터 DB 초기 적재 완료");
    }

    @Test
    public void updateRooms() {
        roomSyncService.generateDefaultRooms();
        log.info("객실 데이터 보정 완료");
    }
}
