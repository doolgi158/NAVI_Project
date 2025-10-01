package com.navi.accommodation.dto.api;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccApiDTO {        /* 외부 API - DB 매핑용 DTO */
    // json 파일 전체 공통
    private Long contentId;
    private String cat3;

    // acc_list.json
    private String title;
    private String addr1;
    private String addr2;
    private String zipcode;
    private String tel;
    private BigDecimal mapx;
    private BigDecimal mapy;
    private LocalDateTime createdTime;
    private LocalDateTime modifiedTime;

    // acc_basic.json
    private String overview;

    // acc_extra.json
    private String checkIn;
    private String checkOut;
    private Boolean hasCooking;
    private Boolean hasParking;
}
