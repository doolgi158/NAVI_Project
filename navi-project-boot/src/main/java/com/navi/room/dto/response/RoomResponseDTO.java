package com.navi.room.dto.response;

import com.navi.room.domain.Room;
import lombok.*;
import java.util.List;

/* =====[RoomResponseDTO]=====
        객실 정보 응답 DTO
   ===========================*/

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomResponseDTO {
    private String roomId;              // 객실 ID
    private String roomName;            // 객실명
    private Integer baseCnt;            // 기본 인원
    private Integer maxCnt;             // 최대 인원
    private Integer weekdayFee;         // 평일 요금
    private Integer weekendFee;         // 주말 요금
    private Boolean hasWifi;            // 와이파이
    private Integer remainingRooms;     // Todo: 잔여 객실 수
    private List<String> roomImages;    // Todo: 객실 이미지 리스트

    /* Entity → DTO 변환 메서드 */
    public static RoomResponseDTO fromEntity(Room room) {
        return RoomResponseDTO.builder()
                .roomId(room.getRoomId())
                .roomName(room.getRoomName())
                .baseCnt(room.getBaseCnt())
                .maxCnt(room.getMaxCnt())
                .weekdayFee(room.getWeekdayFee())
                .weekendFee(room.getWeekendFee())
                .hasWifi(room.getHasWifi())
                .build();
    }
}
