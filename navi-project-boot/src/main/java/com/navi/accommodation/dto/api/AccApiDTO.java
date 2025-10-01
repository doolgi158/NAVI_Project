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
    private Long contentId;
    private String title;
    private String addr1;
    private String addr2;
    private String zipcode;
    private String tel;
    private String cat3;
    private BigDecimal mapx;
    private BigDecimal mapy;
    private LocalDateTime createdTime;
    private LocalDateTime modifiedTime;
}
