package com.navi.accommodation.dto.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/* 외부 API DB 매핑용 DTO */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccApiDTO {
    /* *.json 공통 */
    @JsonProperty("contentid")      // 실제 JSON 키가 다를 경우 @JsonProperty 어노테이션으로 명시해줘야 함
    private Long contentId;
    @JsonProperty("cat3")
    private String category;

    /* acc_list.json */
    private String title;
    private String addr1;
    private String addr2;
    private String zipcode;
    private String tel;
    private BigDecimal mapx;
    private BigDecimal mapy;
    @JsonProperty("createdtime")
    private LocalDateTime createdTime;
    @JsonProperty("modifiedtime")
    private LocalDateTime modifiedTime;

    /* acc_basic.json */
    private String overview;

    /* acc_extra.json */
    @JsonProperty("checkintime")
    private String checkInTime;
    @JsonProperty("checkouttime")
    private String checkOutTime;
    @JsonProperty("chkcooking")
    private Integer hasCooking;
    @JsonProperty("parkinglodging")
    private Integer hasParking;


    /* Getter 재정의
     * JSON 에서 0/1 값으로 들어오기 때문에 DTO 에서는 Integer로 미리 받아두고,
     * 실제 서비스 로직에서는 Boolean 으로 변환하기 위함 */
    public Boolean getHasCooking() {
        return hasCooking != null && hasCooking == 1;
    }
    public Boolean getHasParking() {
        return hasParking != null && hasParking == 1;
    }

    /* category 로직 추가 필요 */
}
