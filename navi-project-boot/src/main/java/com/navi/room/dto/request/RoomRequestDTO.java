package com.navi.room.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/* 객실 등록, 수정 요청 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomRequestDTO {
    private String contentId;
    private String roomName;
    private String roomSize;
    private String roomCnt;
    private String baseCnt;
    private String maxCnt;
    private String weekdayFee;
    private String weekendFee;
    private String hasWifi;
}
