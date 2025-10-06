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

    @JsonProperty("region1cd")
    private NestedCodeDTO region1cd;

    @JsonProperty("region2cd")
    private NestedCodeDTO region2cd;

    @JsonProperty("repPhoto")
    private PhotoInfoDTO repPhoto;

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

                // contentscd 매핑
                .contentsCd(this.contentscd != null ? this.contentscd.getValue() : null)
                .categoryName(this.contentscd != null ? this.contentscd.getLabel() : null)
                .categoryRefId(this.contentscd != null ? this.contentscd.getRefId() : null)

                // region1cd 매핑
                .region1Cd(this.region1cd != null ? this.region1cd.getValue() : null)
                .region1Name(this.region1cd != null ? this.region1cd.getLabel() : null)
                .region1RefId(this.region1cd != null ? this.region1cd.getRefId() : null)

                // region2cd 매핑
                .region2Cd(this.region2cd != null ? this.region2cd.getValue() : null)
                .region2Name(this.region2cd != null ? this.region2cd.getLabel() : null)
                .region2RefId(this.region2cd != null ? this.region2cd.getRefId() : null)

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