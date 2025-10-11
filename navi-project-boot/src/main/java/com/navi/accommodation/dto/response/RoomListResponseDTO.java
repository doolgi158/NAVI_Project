package com.navi.accommodation.dto.response;

import com.navi.accommodation.domain.Room;
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
    private String thumbnailImage; // Todo: 대표 이미지 1장 정도

    public static RoomListResponseDTO fromEntity(Room room) {
        return RoomListResponseDTO.builder()
                .roomId(room.getRoomId())
                .roomName(room.getRoomName())
                .weekdayFee(room.getWeekdayFee())
                .weekendFee(room.getWeekendFee())
                .maxCnt(room.getMaxCnt())
                .hasWifi(room.getHasWifi())
                //.thumbnailImage(room.getThumbnailImageUrl()) // Todo: 이미지
                .build();
    }
}

