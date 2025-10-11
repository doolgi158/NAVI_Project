package com.navi.travel.dto;

import com.navi.travel.domain.Travel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Builder
public class TravelListResponseDTO {
    private Long travelId;
    private String contentId;
    private String title;
    private String categoryName;
    private String region1Name;
    private String region2Name;
    private Double longitude;
    private Double latitude;
    private String tag;
    private String phoneNo;
    private Long photoId;
    private String imagePath;
    private String thumbnailPath;
    private Long views;
    private Long likesCount;
    private Long bookmarkCount;
    private int state;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;

    // ✅ 프론트에서 좋아요/북마크 상태 표시용
    private boolean likedByUser;
    private boolean bookmarkedByUser;

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
                .phoneNo(travel.getPhoneNo())
                .tag(travel.getTag())
                .photoId(travel.getPhotoId())
                .imagePath(travel.getImagePath())
                .thumbnailPath(travel.getThumbnailPath())
                .views(travel.getViews() != null ? travel.getViews() : 0L)
                .state(travel.getState())
                .updatedAt(travel.getUpdatedAt())
                .createdAt(travel.getCreatedAt())
                .likedByUser(false)
                .bookmarkedByUser(false)
                .build();
    }
}
