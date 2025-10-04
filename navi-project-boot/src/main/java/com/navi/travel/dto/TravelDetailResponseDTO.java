package com.navi.travel.dto;

import com.navi.travel.domain.Travel;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class TravelDetailResponseDTO {
    private Long travelId;
    private String contentId;
    private String contentsCd;
    private String categoryName;
    private String categoryRefId;
    private String title;
    private String introduction;
    private String address;
    private String roadAddress;
    private String phoneNo; // Travel 엔티티의 tel 필드와 매핑됨
    private String tag;     // Travel 엔티티의 tags 필드와 매핑됨
    private Double longitude;
    private Double latitude;
    private String region1Name;
    private String region2Name;
    private String imagePath;
    private Long views;
    private Long likes;

    public static TravelDetailResponseDTO of(Travel travel) {
        return TravelDetailResponseDTO.builder()
                .travelId(travel.getTravelId())
                .contentId(travel.getContentId())
                .contentsCd(travel.getContentsCd())
                .categoryName(travel.getCategoryName())
                .categoryRefId(travel.getCategoryRefId())
                .title(travel.getTitle())
                .introduction(travel.getIntroduction())
                .address(travel.getAddress())
                .roadAddress(travel.getRoadAddress())
                .phoneNo(travel.getPhoneNo()) // Travel 엔티티에 getPhoneNo() 추가됨
                .tag(travel.getTag())         // Travel 엔티티에 getTag() 추가됨
                .longitude(travel.getLongitude())
                .latitude(travel.getLatitude())
                .region1Name(travel.getRegion1Name())
                .region2Name(travel.getRegion2Name())
                .imagePath(travel.getImagePath())
                .views(travel.getViews())
                .likes(travel.getLikes())
                .build();
    }
}