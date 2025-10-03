package com.navi.travel.dto;

import com.navi.travel.domain.Travel;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class TravelResponseDTO {
    private Long travelId;
    private String contentId;
    private String categoryName;
    private String title;
    private String introduction;
    private String address;
    private String roadAddress;
    private String tel;
    private String tags;
    private BigDecimal longitude; // 경도
    private BigDecimal latitude; // 위도
    private String region1Name;
    private String region2Name;
    private String imagePath;
    private Long views;
    private Long likes;
    private LocalDateTime createdAt;    //등록일
    private LocalDateTime updatedAt;    //수정일 (사용자기준 최신업데이트 확인용)

    public TravelResponseDTO(Travel travel) {
        this.travelId = travel.getTravelId();
        this.contentId = travel.getContentId();
        this.categoryName = travel.getCategoryName();
        this.title = travel.getTitle();
        this.introduction = travel.getIntroduction();
        this.address = travel.getAddress();
        this.roadAddress = travel.getRoadAddress();
        this.tel = travel.getTel();
        this.tags = travel.getTags();
        this.longitude = travel.getLongitude();
        this.latitude = travel.getLatitude();
        this.region1Name = travel.getRegion1Name();
        this.region2Name = travel.getRegion2Name();
        this.imagePath = travel.getImagePath();
        this.views = travel.getViews();
        this.likes = travel.getLikes();
        this.createdAt = travel.getCreatedAt(); // BaseEntity 상속 필드
        this.updatedAt = travel.getUpdatedAt(); // BaseEntity 상속 필드
    }
}