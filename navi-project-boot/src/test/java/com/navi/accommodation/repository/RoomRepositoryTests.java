package com.navi.accommodation.repository;

import com.navi.accommodation.service.RoomService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Slf4j
public class RoomRepositoryTests {
    @Autowired
    private RoomService roomService;

    @Test
    public void loadRoomData() throws Exception {
        roomService.loadFromJsonFile();
        log.info("API 데이터 DB 초기 적재 완료");
    }
}
