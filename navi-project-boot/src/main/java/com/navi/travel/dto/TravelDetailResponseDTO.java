package com.navi.travel.dto;

import com.navi.travel.domain.Travel;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
    private String phoneNo;
    private String tag;
    private Double longitude;
    private Double latitude;
    private String region1Name;
    private String region2Name;
    private String imagePath;
    private Long views;
    private Long likes;
    private Long bookmark;

    // ✅ 중요: 사용자 상태 값
    private boolean isLikedByUser;
    private boolean isBookmarkedByUser;

    private LocalDate updatedAt;
    private LocalDate createdAt;

    public static TravelDetailResponseDTO of(Travel travel, boolean isLikedByUser, boolean isBookmarkedByUser) {
        LocalDateTime createdAtLDT = null;
        LocalDateTime updatedAtLDT = null;

        try {
            createdAtLDT = travel.getCreatedAt();
            updatedAtLDT = travel.getUpdatedAt();
        } catch (Exception e) {
            // 필요 시 변환 로직 추가
        }

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
                .phoneNo(travel.getPhoneNo())
                .tag(travel.getTag())
                .longitude(travel.getLongitude())
                .latitude(travel.getLatitude())
                .region1Name(travel.getRegion1Name())
                .region2Name(travel.getRegion2Name())
                .imagePath(travel.getImagePath())
                .views(travel.getViews())
                .likes(travel.getLikes())
                .bookmark(travel.getBookmark())

                // ✅ 여기 반드시 추가해야 함 (사용자 상태값 반영)
                .isLikedByUser(isLikedByUser)
                .isBookmarkedByUser(isBookmarkedByUser)

                // ✅ LocalDate 변환
                .createdAt(createdAtLDT != null ? createdAtLDT.toLocalDate() : null)
                .updatedAt(updatedAtLDT != null ? updatedAtLDT.toLocalDate() : null)
                .build();
    }
}
