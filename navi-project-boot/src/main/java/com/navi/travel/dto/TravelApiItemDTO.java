//package com.navi.travel.dto;
//
//import com.fasterxml.jackson.annotation.JsonProperty;
//import com.navi.travel.domain.Travel;
//import lombok.Getter;
//import lombok.NoArgsConstructor;
//import lombok.Setter;
//import lombok.ToString;
//
///**
// * API 응답의 개별 여행지 데이터를 담는 DTO 클래스.
// * (TravelApiResponseBody.java에서 분리된 파일)
// */
//@Getter
//@Setter
//@ToString
//@NoArgsConstructor
//public class TravelApiItemDTO {
//
//    // API 응답 필드와 매핑
//    @JsonProperty("contentsid")
//    private String contentId;
//
//    @JsonProperty("contentscd")
//    private NestedCodeDTO contentscd;
//
//    @JsonProperty("title")
//    private String title;
//
//    // ✅ region1cd, region2cd를 객체로 변경
//    @JsonProperty("region1cd")
//    private RegionDTO region1cd;
//
//    @JsonProperty("region2cd")
//    private RegionDTO region2cd;
//
//    @JsonProperty("address")
//    private String address;
//
//    @JsonProperty("roadaddress")
//    private String roadAddress;
//
//    @JsonProperty("tag")
//    private String tag;
//
//    @JsonProperty("introduction")
//    private String introduction;
//
//    @JsonProperty("latitude")
//    private Double latitude;
//
//    @JsonProperty("longitude")
//    private Double longitude;
//
//    @JsonProperty("phoneno")
//    private String phoneNo;
//
//    @JsonProperty("repPhoto")
//    private PhotoInfoDTO repPhoto;
//
//    @JsonProperty("homepage")
//    private String homepage;
//
//    @JsonProperty("parking")
//    private String parking;
//
//    @JsonProperty("fee")
//    private String fee;
//
//    @JsonProperty("hours")
//    private String hours; // API 필드명이 'hours'일 경우
//
//
//    // ✅ region DTO 정의 (label만 사용)
//    @Getter
//    @Setter
//    @ToString
//    @NoArgsConstructor
//    public static class RegionDTO {
//        @JsonProperty("value")
//        private String value;
//        @JsonProperty("label")
//        private String label;
//        @JsonProperty("refId")
//        private String refId;
//    }
//
//
//    /**
//     * ✅ API DTO → Travel 엔티티 변환
//     * label만 DB에 저장되도록 수정됨
//     */
//    public Travel toEntity() {
//        return Travel.builder()
//                .contentId(this.contentId)
//                .title(this.title)
//                .introduction(this.introduction)
//                .address(this.address)
//                .roadAddress(this.roadAddress)
//                .phoneNo(this.phoneNo)
//                .tag(this.tag)
//                .latitude(this.latitude)
//                .longitude(this.longitude)
//                .categoryName(this.contentscd != null ? this.contentscd.getLabel() : null)
//
//                // ✅ region1cd.label, region2cd.label만 DB에 저장
//                .region1Name(this.region1cd != null ? this.region1cd.getLabel() : null)
//                .region2Name(this.region2cd != null ? this.region2cd.getLabel() : null)
//
//                // ✅ repPhoto 매핑
//                .photoId(
//                        this.repPhoto != null && this.repPhoto.getPhotoId() != null
//                                ? this.repPhoto.getPhotoId().getPhotoId() : null
//                )
//                .imagePath(
//                        this.repPhoto != null && this.repPhoto.getPhotoId() != null
//                                ? this.repPhoto.getPhotoId().getImgPath() : null
//                )
//                .thumbnailPath(
//                        this.repPhoto != null && this.repPhoto.getPhotoId() != null
//                                ? this.repPhoto.getPhotoId().getThumbnailPath() : null
//                )
//                .homepage(this.homepage)
//                .parking(this.parking)
//                .fee(this.fee)
//                .hours(this.hours)
//                .state(1) // 기본 공개 상태
//                .build();
//    }
//
//
//    // ✅ 내부 코드 및 사진 DTO들
//    @Getter
//    @Setter
//    @ToString
//    @NoArgsConstructor
//    public static class NestedCodeDTO {
//        @JsonProperty("value")
//        private String value;
//
//        @JsonProperty("label")
//        private String label;
//
//        @JsonProperty("refId")
//        private String refId;
//    }
//
//    @Getter
//    @Setter
//    @ToString
//    @NoArgsConstructor
//    public static class PhotoInfoDTO {
//        @JsonProperty("photoid")
//        private PhotoDetailDTO photoId;
//    }
//
//    @Getter
//    @Setter
//    @ToString
//    @NoArgsConstructor
//    public static class PhotoDetailDTO {
//        @JsonProperty("photoid")
//        private Long photoId;
//
//        @JsonProperty("imgpath")
//        private String imgPath;
//
//        @JsonProperty("thumbnailpath")
//        private String thumbnailPath;
//    }
//}
