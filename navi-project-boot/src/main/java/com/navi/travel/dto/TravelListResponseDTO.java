package com.navi.travel.dto;

import com.navi.travel.domain.Travel;
import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
public class TravelListResponseDTO {
    private Long travelId;
    private String contentId;   //api 컨텐츠id
    private String title;       // 제목
    private String categoryName; //카테고리명
    private String region1Name; //시명
    private String region2Name ;    //읍명
    private Double longitude;   //경도
    private Double latitude;    //위도
    private String tag;     //태그
    private String phoneNo; //전화번호
    private String imagePath;    //대표이미지 경로
    private String thumbnailPath;   // 썸네일 경로
    private Long views;         // 조회수
    private Long likes;         // 좋아요 수

    public static TravelListResponseDTO of(Travel travel) {
        return TravelListResponseDTO.builder()
                .travelId(travel.getTravelId())
                .contentId(travel.getContentId())
                .title(travel.getTitle())
                .categoryName(travel.getCategoryName())
                .region1Name(travel.getRegion1Name())
                .region2Name(travel.getRegion2Name())
                .longitude(travel.getLongitude())
                .latitude(travel.getLatitude())
                .phoneNo(travel.getPhoneNo() != null ? travel.getPhoneNo() : null)
                .tag(travel.getTag() != null ? travel.getTag() : null)
                .imagePath(travel.getImagePath() != null ? travel.getImagePath() : null)
                .thumbnailPath(travel.getThumbnailPath() != null ? travel.getThumbnailPath() : null)
                .views(travel.getViews() != null ? travel.getViews() : 0L) // Long 타입 0L로 초기화
                .likes(travel.getLikes() != null ? travel.getLikes() : 0L)   // Long 타입 0L로 초기화
                .build();
    }
}