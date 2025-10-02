package com.navi.travel.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class TravelApiItemDTO {
    private String alltag;
    private String contentsid; // 테이블의 CONTENTS_ID
    private ContentsCdDTO contentscd; // 중첩 객체
    private String title;
    private RegionCdDTO region1cd; // 중첩 객체
    private RegionCdDTO region2cd; // 중첩 객체
    private String address;
    private String roadaddress;
    private String tag;
    private String introduction;
    private BigDecimal latitude; // 테이블의 MAPY (위도)
    private BigDecimal longitude; // 테이블의 MAPX (경도)
    private String postcode; // 테이블의 ZIPCODE
    private String phoneno; // 테이블의 TEL
    private RepPhotoDTO repPhoto; // 2단계 중첩 객체
    private Long likes;
    private Long views;

    //중첩 객체 DTO 정의
    @Getter @Setter @NoArgsConstructor
    public static class ContentsCdDTO {
        private String value;
        private String label;
        private String refId;
    }

    @Getter @Setter @NoArgsConstructor
    public static class RegionCdDTO {
        private String value;
        private String label;
        private String refId;
    }

    @Getter @Setter @NoArgsConstructor
    public static class RepPhotoDTO {
        private String descseo;
        private PhotoIdDTO photoid;
    }

    @Getter @Setter @NoArgsConstructor
    public static class PhotoIdDTO  {
        private Long photoid;
        private String imgpath;
        private String thumbnailpath;
    }
}
