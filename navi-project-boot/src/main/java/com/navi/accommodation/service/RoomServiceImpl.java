package com.navi.accommodation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.domain.Room;
import com.navi.accommodation.dto.api.RoomApiDTO;
import com.navi.accommodation.repository.AccRepository;
import com.navi.accommodation.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {
    public final AccRepository accRepository;
    public final RoomRepository roomRepository;
    public final ObjectMapper objectMapper;

    /* === 관리자 전용 API 적재 === */
    //JSON 파일 경로 지정
    @Value("classpath:accMockData/acc_rooms.json")   // 숙소 전체 리스트(최초 적재)
    private Resource roomFile;

    @Override
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

                // 객실명(roomtitle)이 없는 경우 SKIP
                if (dto.getRoomName() == null || dto.getRoomName().isBlank()) {
                    log.warn("roomtitle 누락 → 등록 SKIP (contentId={})", dto.getContentId());
                    continue;
                }

                // 중복 검사: 동일 숙소 내 동일 객실명 존재 시 skip
                boolean exists = roomRepository.findAllByContentId(contentId)
                        .stream().anyMatch(r -> r.getRoomName().equals(dto.getRoomName()));

                if (exists) {
                    log.info("이미 존재 → SKIP: [{}] {}", contentId, dto.getRoomName());
                    continue;
                }

                Room room = Room.builder()
                        .acc(acc)
                        .build();
                room.changeFromApiDTO(dto);

                roomRepository.save(room);
                log.info("객실 등록 완료: [{}] {}", contentId, dto.getRoomName());
            }
        }
    }


}
