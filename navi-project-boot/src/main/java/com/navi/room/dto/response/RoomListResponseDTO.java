package com.navi.room.dto.response;

import com.navi.room.domain.Room;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomListResponseDTO {
    private String roomId;
    private String roomName;
    private Integer weekdayFee;
    private Integer weekendFee;
    private Integer maxCnt;
    private Boolean hasWifi;
    private Integer remainCount;    // 잔여 객실 수 추가
    private String mainImage;       // 대표 이미지

    public static RoomListResponseDTO fromEntity(Room room, Integer remainCount) {
        return RoomListResponseDTO.builder()
                .roomId(room.getRoomId())
                .roomName(room.getRoomName())
                .weekdayFee(room.getWeekdayFee())
                .weekendFee(room.getWeekendFee())
                .maxCnt(room.getMaxCnt())
                .hasWifi(room.getHasWifi())
                .remainCount(remainCount)
                .mainImage(room.getMainImage())
                .build();
    }
}

