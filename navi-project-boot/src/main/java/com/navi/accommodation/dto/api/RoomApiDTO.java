package com.navi.accommodation.dto.api;

/* 외부 API DB 매핑용 DTO - 객실 */

import com.fasterxml.jackson.annotation.JsonProperty;
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
}
