package com.navi.room.dto.api;

/* 외부 API DB 매핑용 DTO - 객실 */

import com.fasterxml.jackson.annotation.JsonProperty;
import com.navi.accommodation.domain.Acc;
import com.navi.room.domain.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomApiDTO {
    @JsonProperty("contentid")
    private String contentId;

    @JsonProperty("roomtitle")
    private String roomName;

    @JsonProperty("roomsize")
    private String roomSize;

    @JsonProperty("roomcount")
    private String roomCnt;

    @JsonProperty("roombasecount")
    private String baseCnt;

    @JsonProperty("roommaxcount")
    private String maxCnt;

    @JsonProperty("roomoffseasonminfee1")
    private String weekdayFee;

    @JsonProperty("roomoffseasonminfee2")
    private String weekendFee;

    @JsonProperty("roominternet")
    private String hasWifi;

    public static RoomApiDTO fromEntity(Room room) {
        RoomApiDTO dto = new RoomApiDTO();

        dto.setContentId(room.getContentId() != null ? String.valueOf(room.getContentId()) : null);
        dto.setRoomName(room.getRoomName());
        dto.setRoomSize(room.getRoomSize() != null ? String.valueOf(room.getRoomSize()) : null);
        dto.setRoomCnt(room.getRoomCnt() != null ? String.valueOf(room.getRoomCnt()) : null);
        dto.setBaseCnt(room.getBaseCnt() != null ? String.valueOf(room.getBaseCnt()) : null);
        dto.setMaxCnt(room.getMaxCnt() != null ? String.valueOf(room.getMaxCnt()) : null);
        dto.setWeekdayFee(room.getWeekdayFee() != null ? String.valueOf(room.getWeekdayFee()) : null);
        dto.setWeekendFee(room.getWeekendFee() != null ? String.valueOf(room.getWeekendFee()) : null);
        dto.setHasWifi(room.getHasWifi() != null && room.getHasWifi() ? "1" : "0");

        return dto;
    }

    public Room toEntity(Acc acc) {
        return Room.builder()
                .acc(acc)
                .contentId(parseLong(contentId))
                .roomName(roomName)
                .roomSize(parseInt(roomSize))
                .roomCnt(parseIntOrDefault(roomCnt, 1))
                .baseCnt(parseIntOrDefault(baseCnt, 2))
                .maxCnt(parseIntOrDefault(maxCnt, 2))
                .weekdayFee(parseIntOrDefault(weekdayFee, 0))
                .weekendFee(parseIntOrDefault(weekendFee, 0))
                .hasWifi("1".equals(hasWifi))
                .isActive(true)
                .build();
    }

    private Integer parseInt(String value) {
        try {
            return value != null && !value.isBlank() ? Integer.parseInt(value) : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer parseIntOrDefault(String value, int defaultValue) {
        Integer result = parseInt(value);
        return result != null ? result : defaultValue;
    }

    private Long parseLong(String value) {
        try {
            return value != null && !value.isBlank() ? Long.parseLong(value) : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }
}