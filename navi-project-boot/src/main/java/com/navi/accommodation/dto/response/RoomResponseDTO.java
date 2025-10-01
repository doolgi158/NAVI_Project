package com.navi.accommodation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomResponseDTO {
    private String roomId;
    private String roomName;
    private Integer roomSize;
    private Integer roomCnt;
    private Integer baseCnt;
    private Integer maxCnt;
    private Integer weekdayFee;
    private Integer weekendFee;

    // 예약 가능 잔여 객실 수
    private Integer remainingRooms;
    // 객실 이미지
    //private List<String> images;
}
