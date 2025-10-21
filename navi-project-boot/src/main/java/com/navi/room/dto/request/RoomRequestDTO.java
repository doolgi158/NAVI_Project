package com.navi.room.dto.request;

import com.navi.room.domain.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/* 객실 등록, 수정 요청 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomRequestDTO {
    private Long accNo;
    private String contentId;
    private String roomName;
    private String roomSize;
    private String roomCnt;
    private String baseCnt;
    private String maxCnt;
    private String weekdayFee;
    private String weekendFee;
    private String hasWifi;

    public Room toEntity() {
        return Room.builder()
                .roomName(roomName)
                .roomSize(Integer.parseInt(roomSize))
                .roomCnt(Integer.parseInt(roomCnt))
                .baseCnt(Integer.parseInt(baseCnt))
                .maxCnt(Integer.parseInt(maxCnt))
                .weekdayFee(Integer.parseInt(weekdayFee))
                .weekendFee(Integer.parseInt(weekendFee))
                .hasWifi("1".equals(hasWifi))
                .build();
    }
}
