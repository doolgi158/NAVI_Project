package com.navi.travel.dto;

import com.navi.travel.domain.Travel;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelApiItemDTO {

    // 외부 API의 여행지 ID
    private String contentId;

    // 카테고리 정보
    private String contentsCd;  // 카테고리 id
    private String categoryName;    // 카테고리 이름
    private String categoryRefId;   // 카테고리 참조id

    // 기본 정보
    private String title;   // 여행지 제목
    private String introduction;    // 여행지 소개 (CLOB)

    // 주소 및 연락처
    private String address;     // 지번주소
    private String roadAddress;     // 도로명 주소
    private String zipcode;     // 우편번호
    private String tel;     // 전화번호
    private String tags;    // 태그정보

    // GPS 좌표
    private BigDecimal longitude; // 경도
    private BigDecimal latitude; // 위도

    // 지역 코드 정보
    private String region1Cd;   // 시코드
    private String region1Name;     // 시명
    private String region1RefId;    // 시참조id
    private String region2Cd;    // 읍코드
    private String region2Name; // 읍명
    private String region2RefId;    // 읍참조id

    // 사진 정보
    private RepPhoto repPhoto;

    // 관리 정보
    private int state;  // 개시상태(공개, 비공개)

//    public Travel toEntity() {
//        return Travel.builder()
//                .contentId(this.contentId)
//                .contentsCd(this.contentsCd)
//                .categoryName(this.categoryName)
//                .categoryRefId(this.categoryRefId)
//                .title(this.title)
//                .introduction(this.introduction)
//                .address(this.address)
//                .roadAddress(this.roadAddress)
//                .zipcode(this.zipcode)
//                .tel(this.tel)
//                .tags(this.tags)
//                .longitude(this.longitude)
//                .latitude(this.latitude)
//                .region1Cd(this.region1Cd)
//                .region1Name(this.region1Name)
//                .region1RefId(this.region1RefId)
//                .region2Cd(this.region2Cd)
//                .region2Name(this.region2Name)
//                .region2RefId(this.region2RefId)
//                .photoId(this.getSafePhotoId())
//                .imagePath(this.getSafeImagePath())
//                .thumbnailPath(this.getSafeThumbnailPath())
//                .state(this.state)
//                .build();
//    }

    // 안전하게 photoId를 가져오는 헬퍼 메서드
    public Long getSafePhotoId() {
        if (this.repPhoto != null && this.repPhoto.getPhotoid() != null) {
            // API 응답 구조에 따라 getPhotoid()가 Long을 반환한다고 가정
            return this.repPhoto.getPhotoid().getPhotoid();
        }
        return null; // RepPhoto 또는 Photoid가 null이면 안전하게 null 반환
    }

    // 안전하게 이미지 경로를 가져오는 헬퍼 메서드
    public String getSafeImagePath() {
        if (this.repPhoto != null && this.repPhoto.getPhotoid() != null) {
            return this.repPhoto.getPhotoid().getImgpath();
        }
        return null; // RepPhoto가 null이면 안전하게 null 반환
    }

    // 안전하게 썸네일 경로를 가져오는 헬퍼 메서드
    public String getSafeThumbnailPath() {
        if (this.repPhoto != null && this.repPhoto.getPhotoid() != null) {
            return this.repPhoto.getPhotoid().getThumbnailpath();
        }
        return null; // RepPhoto가 null이면 안전하게 null 반환
    }

    @Getter
    @Setter
    public static class RepPhoto {
        private PhotoId photoid;

        @Getter
        @Setter
        public static class PhotoId {
            private Long photoid;
            private String imgpath;
            private String thumbnailpath;
        }
    }


}
