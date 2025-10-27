package com.navi.travel.dto;

import com.navi.travel.domain.Travel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.UUID;

// 여행지 등록 및 수정 요청을 받는 DTO
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelRequestDTO {

    // 수정 시 사용 (등록 시에는 null)
    private Long travelId;

    // Admin이 직접 입력/수정할 필드
    private String contentId;       // API 연동용 ID (수동 등록 시 선택적)
    private String contentsCd;      // 카테고리 코드 (필수)
    private String title;           // 제목 (필수)
    private String introduction;    // 소개
    private String description;     // 본문 내용
    private String address;         // 주소
    private String roadAddress;     // 도로명 주소
    private String phoneNo;         // 전화번호
    private String tag;             // 태그
    private Double longitude;       // 경도
    private Double latitude;        // 위도
    private String categoryName;    // 카테고리 이름
    private String region1Name;     // 지역1 이름 (시/도)
    private String region2Name;     // 지역2 이름 (시/군/구)
    private Long photoId;           // 포토 아이디
    private String imagePath;       // 대표 이미지 경로
    private String thumbnailPath;   // 썸네일 경로
    private int state;              // 공개 상태 (1:공개, 0:비공개)
    private String homepage;        // 홈페이지
    private String parking;         // 주차정보
    private String fee;             // 이용요금
    private String hours;           // 이용시간


    // DTO를 Entity로 변환하는 메서드 (등록 시 사용)
    public Travel toEntity() {

        // contentId가 null이거나 비어있을 경우 UUID로 자동 생성
        String finalContentId = this.contentId;
        if (finalContentId == null || finalContentId.trim().isEmpty()) {
            finalContentId = "CNTS-" + UUID.randomUUID().toString();
        }


        return Travel.builder()
                .contentId(finalContentId)
                .contentsCd(this.contentsCd != null ? this.contentsCd : "c1")
                .categoryName(this.categoryName != null ? this.categoryName : "관광지")
                .title(this.title)
                .introduction(this.introduction)
                .description(this.description)
                .address(this.address)
                .roadAddress(this.roadAddress)
                .phoneNo(this.phoneNo)
                .tag(this.tag)
                .longitude(this.longitude)
                .latitude(this.latitude)
                .region1Name(this.region1Name)
                .region2Name(this.region2Name)
                .photoId(this.photoId)
                .imagePath(imagePath)
                .thumbnailPath(this.thumbnailPath)
                .state(this.state)
                .homepage(this.homepage)
                .parking(this.parking)
                .fee(this.fee)
                .hours(this.hours)

                .views(0L)
                .build();
    }

}