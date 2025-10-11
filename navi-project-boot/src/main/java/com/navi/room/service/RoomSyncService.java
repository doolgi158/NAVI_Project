package com.navi.room.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.accommodation.domain.Acc;
import com.navi.room.domain.Room;
import com.navi.room.dto.api.RoomApiDTO;
import com.navi.accommodation.repository.AccRepository;
import com.navi.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomSyncService {
    private final AccRepository accRepository;
    private final RoomRepository roomRepository;
    public final ObjectMapper objectMapper;

    /* === 관리자 전용 API 적재 === */
    @Value("classpath:mockData/acc_rooms.json")
    private Resource roomFile;

    @Transactional
    public void loadFromJsonFile() throws IOException {
        processJson(roomFile);
        log.info("객실 JSON 데이터 초기 적재 완료 ✅");
    }

    private void processJson(Resource file) throws IOException {
        JsonNode root = objectMapper.readTree(file.getInputStream());
        JsonNode items = root.path("response").path("body").path("items");

        for (JsonNode wrapper : items) {
            // .asText() : JsonNode 내부 값을 String 으로 변환하고 null일 경우 null로 반환
            String contentIdStr = wrapper.path("contentid").asText(null);
            if (contentIdStr == null || contentIdStr.isBlank()) continue;

            Long contentId = Long.parseLong(contentIdStr);

            // 숙소 찾기 (FK)
            Acc acc = accRepository.findByContentId(contentId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 숙소 없음: " + contentId));

            // 객실 리스트
            JsonNode roomArray = wrapper.path("item");
            if (!roomArray.isArray()) continue;

            for (JsonNode roomNode : roomArray) {
                RoomApiDTO dto = objectMapper.treeToValue(roomNode, RoomApiDTO.class);

                // 객실명(roomTitle)이 없는 경우 SKIP
                if (dto.getRoomName() == null || dto.getRoomName().isBlank()) {
                    log.warn("roomTitle 누락 → 등록 SKIP (contentId={})", dto.getContentId());
                    continue;
                }

                // 중복 검사: 동일 숙소 내 동일 객실명 존재 시 skip
                boolean exists = roomRepository.findAllByContentId(contentId)
                        .stream().anyMatch(r -> r.getRoomName().equals(dto.getRoomName()));

                if (exists) {
                    log.info("이미 존재 → SKIP: [{}] {}", contentId, dto.getRoomName());
                    continue;
                }

                Room room = Room.builder().acc(acc).build();
                room.changeFromApiDTO(dto);

                roomRepository.save(room);
                log.info("객실 등록 완료: [{}] {}", contentId, dto.getRoomName());
            }
        }
    }

    /* === 추가 데이터 수정 (후처리) === */
    @Transactional
    public void generateDefaultRooms() {
        List<Acc> accList = accRepository.findAllWithoutContentId();

        for (Acc acc : accList) {
            List<Room> roomList = roomRepository.findByAcc(acc);
            createDefaultRooms(acc);
            log.info("[CREATE] contentId 없는 숙소 → 기본 객실 생성 : {}", acc.getTitle());
        }
        log.info("✅ [SYNC] contentId=null 숙소 기본 객실 생성 완료");
    }

    /* 공통 객실 생성 메서드 */
    private void createDefaultRooms(Acc acc) {
        // [0] 객실명 / [1] 기준인원 / [2] 최대인원 / [3] 크기(m²) / [4] 객실수
        String[][] defaults = {
                {"스탠다드룸", "2", "4", "20", "10"},
                {"디럭스룸", "2", "6", "35", "6"},
                {"패밀리룸", "4", "8", "50", "3"}
        };

        for(String[] info : defaults) {
            int weekday = randomWeekdayPriceBySize(Integer.parseInt(info[3]));
            int weekend = weekday + randomWeekendDiff(Integer.parseInt(info[3]));

            Room room = Room.builder()
                    .acc(acc)
                    .roomName(info[0])
                    .baseCnt(Integer.parseInt(info[1]))
                    .maxCnt(Integer.parseInt(info[2]))
                    .roomSize(Integer.parseInt(info[3]))
                    .roomCnt(Integer.parseInt(info[4]))
                    .weekdayFee(weekday)
                    .weekendFee(weekend)
                    .build();

            roomRepository.save(room);
        }
    }

    /* === 가격 랜덤 생성 (크기 기반 가중치) === */
    private int randomWeekdayPriceBySize(int roomSize) {
        if (roomSize <= 25) {
            return ThreadLocalRandom.current().nextInt(80_000, 120_001);
        } else if (roomSize <= 40) {
            return ThreadLocalRandom.current().nextInt(120_000, 160_001);
        } else {
            return ThreadLocalRandom.current().nextInt(160_000, 220_001);
        }
    }
    /* === 주말 요금 차이 (크기 기반 가중치) === */
    private int randomWeekendDiff(int roomSize) {
        if (roomSize <= 25) {
            return ThreadLocalRandom.current().nextInt(10_000, 30_001);
        } else if (roomSize <= 40) {
            return ThreadLocalRandom.current().nextInt(20_000, 40_001);
        } else {
            return ThreadLocalRandom.current().nextInt(30_000, 60_001);
        }
    }
}
