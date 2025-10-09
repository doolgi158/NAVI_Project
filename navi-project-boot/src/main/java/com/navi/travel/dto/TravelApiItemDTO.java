package com.navi.travel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.navi.travel.domain.Travel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * API 응답의 개별 여행지 데이터를 담는 DTO 클래스.
 * (TravelApiResponseBody.java에서 분리된 파일)
 */
@Getter
@Setter
@ToString
@NoArgsConstructor
public class TravelApiItemDTO {

    // API 응답 필드와 매핑
    @JsonProperty("contentsid")
    private String contentId;

    @JsonProperty("contentscd")
    private NestedCodeDTO contentscd;

    @JsonProperty("title")
    private String title;

    @JsonProperty("introduction")
    private String introduction;

    @JsonProperty("address")
    private String address;

    @JsonProperty("roadaddress")
    private String roadAddress;

    @JsonProperty("tag")
    private String tag;

    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("longitude")
    private Double longitude;

    @JsonProperty("phoneno")
    private String phoneNo;

    @JsonProperty("repPhoto")
    private PhotoInfoDTO repPhoto;

    @JsonProperty("homepage")
    private String homepage;

    @JsonProperty("parking")
    private String parking;

    @JsonProperty("fee")
    private String fee;

    // API 필드명이 'hours'일 경우
    @JsonProperty("hours")
    private String hours;

    /**
     * API DTO → Travel 엔티티 변환
     */
    public Travel toEntity() {
        return Travel.builder()
                .contentId(this.contentId)
                .title(this.title)
                .introduction(this.introduction)
                .address(this.address)
                .roadAddress(this.roadAddress)
                .phoneNo(this.phoneNo)
                .tag(this.tag)
                .latitude(this.latitude)  // Double 변환 제거
                .longitude(this.longitude)
                .contentsCd(this.contentscd != null ? this.contentscd.getValue() : null)
                .categoryName(this.contentscd != null ? this.contentscd.getLabel() : null)
                .region1Name(null) // API 코드 필드 제거에 따라 null로 설정하거나 제거 (일단 null 유지)
                .region2Name(null) // API 코드 필드 제거에 따라 null로 설정하거나 제거 (일단 null 유지)

                // repPhoto 매핑
                .photoId(
                        this.repPhoto != null && this.repPhoto.getPhotoId() != null
                                ? this.repPhoto.getPhotoId().getPhotoId() : null
                )
                .imagePath(
                        this.repPhoto != null && this.repPhoto.getPhotoId() != null
                                ? this.repPhoto.getPhotoId().getImgPath() : null
                )
                .thumbnailPath(
                        this.repPhoto != null && this.repPhoto.getPhotoId() != null
                                ? this.repPhoto.getPhotoId().getThumbnailPath() : null
                )
                .homepage(this.homepage)
                .parking(this.parking)
                .fee(this.fee)
                .hours(this.hours)

                // 초기값 설정
                .state(1) // 기본 공개 상태
                .build();
    }

    @Getter
    @Setter
    @ToString
    @NoArgsConstructor
    public static class NestedCodeDTO {
        @JsonProperty("value")
        private String value;

        @JsonProperty("label")
        private String label;

        @JsonProperty("refId")
        private String refId;
    }

    @Getter
    @Setter
    @ToString
    @NoArgsConstructor
    public static class PhotoInfoDTO {
        @JsonProperty("photoid")
        private PhotoDetailDTO photoId;
    }

    @Getter
    @Setter
    @ToString
    @NoArgsConstructor
    public static class PhotoDetailDTO {
        @JsonProperty("photoid")
        private Long photoId;

        @JsonProperty("imgpath")
        private String imgPath;

        @JsonProperty("thumbnailpath")
        private String thumbnailPath;
    }
}