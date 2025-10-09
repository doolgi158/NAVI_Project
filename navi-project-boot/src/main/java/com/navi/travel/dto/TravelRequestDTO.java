package com.navi.travel.dto;

import com.navi.travel.domain.Travel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

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
    private String address;         // 주소
    private String roadAddress;     // 도로명 주소
    private String phoneNo;         // 전화번호
    private String tag;             // 태그
    private Double longitude;       // 경도
    private Double latitude;        // 위도
    private String categoryName;    // 카테고리 이름
    private String region1Name;     // 지역1 이름 (시/도)
    private String region2Name;     // 지역2 이름 (시/군/구)
    private String imagePath;       // 대표 이미지 경로
    private String thumbnailPath;   // 썸네일 경로
    private int state;          // 공개 상태 (1:공개, 0:비공개)

    // DTO를 Entity로 변환하는 메서드 (등록 시 사용)
    public Travel toEntity() {
        return Travel.builder()
                .contentId(this.contentId)
                .contentsCd(this.contentsCd)
                .categoryName(this.categoryName)
                .title(this.title)
                .introduction(this.introduction)
                .address(this.address)
                .roadAddress(this.roadAddress)
                .phoneNo(this.phoneNo)
                .tag(this.tag)
                .longitude(this.longitude)
                .latitude(this.latitude)
                .region1Name(this.region1Name)
                .region2Name(this.region2Name)
                .imagePath(this.imagePath)
                .thumbnailPath(this.thumbnailPath)
                .state(this.state)
                // 신규 등록 시 조회수/좋아요/북마크는 0으로 초기화
                .views(0L)
                .likes(0L)
                .bookmark(0L)
                .build();
    }
}