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
    private String region1Name; //시명
    private String region2Name ;    //읍명
    private String thumbnailPath;   // 썸네일 경로
    private Long views;         // 조회수
    private Long likes;         // 좋아요 수

    public static TravelListResponseDTO of(Travel Travel) {
        return TravelListResponseDTO.builder()
                .travelId(Travel.getTravelId())
                .contentId(Travel.getContentId())
                .title(Travel.getTitle())
                .region1Name(Travel.getRegion1Name())
                .region2Name(Travel.getRegion2Name())
                .thumbnailPath(Travel.getThumbnailPath())
                .views(Travel.getViews())
                .likes(Travel.getLikes())
                .build();
    }
}