package com.navi.accommodation.dto.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ========================================================
 * [AccApiDTO]
 * : 외부 관광공사 OPEN API (TourAPI) 숙소 데이터 매핑용 DTO
 * ========================================================
 * ㄴ acc_list.json  : 기본 숙소 정보 (주소, 좌표 등)
 * ㄴ acc_basic.json : 숙소 상세 설명
 * ㄴ acc_extra.json : 부가 정보 (체크인/체크아웃, 주차, 취사 등)
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccApiDTO {
    /** 공통 필드 */
    @JsonProperty("contentid")
    private String contentId;           // 공공데이터 원본 ID

    @JsonProperty("cat3")
    private String category;            // 카테고리 코드

    /** acc_list.json */
    private String title;               // 숙소명
    private String addr1;               // 기본 주소
    private String addr2;               // 상세 주소
    // private String zipcode;          // 필요시 확장 가능
    private String tel;                 // 전화번호
    private String mapx;                // 경도
    private String mapy;                // 위도

    @JsonProperty("createdtime")
    private String createdTime;         // 등록 일시

    @JsonProperty("modifiedtime")
    private String modifiedTime;        // 수정일시

    /** acc_basic.json */
    private String overview;            // 숙소 설명

    /** acc_extra.json */
    @JsonProperty("checkintime")
    private String checkInTime;         // 체크인 시간

    @JsonProperty("checkouttime")
    private String checkOutTime;        // 체크아웃 시간

    @JsonProperty("chkcooking")
    private String hasCooking;          // 취사 가능 여부

    @JsonProperty("parkinglodging")
    private String hasParking;          // 주차 가능 여부
}
