package com.navi.accommodation.dto.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/* 외부 API DB 매핑용 DTO - 숙소 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccApiDTO {
    /* *.json 공통 */
    @JsonProperty("contentid")      // 실제 JSON 키가 다를 경우 @JsonProperty 어노테이션으로 명시해줘야 함
    private String contentId;

    @JsonProperty("cat3")
    private String category;

    /* acc_list.json */
    private String title;
    private String addr1;
    private String addr2;
    // private String zipcode;
    private String tel;
    private String mapx;
    private String mapy;

    @JsonProperty("createdtime")
    private String createdTime;

    @JsonProperty("modifiedtime")
    private String modifiedTime;

    /* acc_basic.json */
    private String overview;

    /* acc_extra.json */
    @JsonProperty("checkintime")
    private String checkInTime;

    @JsonProperty("checkouttime")
    private String checkOutTime;

    @JsonProperty("chkcooking")
    private String hasCooking;

    @JsonProperty("parkinglodging")
    private String hasParking;
}
