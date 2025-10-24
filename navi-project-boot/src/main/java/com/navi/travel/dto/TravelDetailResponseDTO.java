package com.navi.travel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    private String title;
    private String introduction;
    private String description;
    private String address;
    private String roadAddress;
    private String phoneNo;
    private String tag;
    private Double longitude;
    private Double latitude;
    private String region1Name;
    private String region2Name;
    private Long photoId;
    private String imagePath;
    private String thumbnailPath;

    // ✅ 조회수/좋아요/북마크
    private Long views;
    private Long likesCount;
    private Long bookmarkCount;

    private int state;
    private String homepage;
    private String parking;
    private String fee;
    private String hours;

    // ✅ 사용자 상태 값
    @JsonProperty("likedByUser")
    private boolean isLikedByUser;

    @JsonProperty("bookmarkedByUser")
    private boolean isBookmarkedByUser;

    private LocalDate updatedAt;
    private LocalDate createdAt;

    /**
     * ✅ Travel 엔티티를 기반으로 DTO 생성
     * - 조회수, 좋아요, 북마크, 사용자 상태 반영
     * - 조회수 null 방지 및 즉시 반영된 값 포함
     */
    public static TravelDetailResponseDTO of(
            Travel travel,
            Long likesCount,
            Long bookmarkCount,
            boolean isLikedByUser,
            boolean isBookmarkedByUser
    ) {
        LocalDateTime createdAtLDT = travel.getCreatedAt();
        LocalDateTime updatedAtLDT = travel.getUpdatedAt();

        return TravelDetailResponseDTO.builder()
                .travelId(travel.getTravelId())
                .contentId(travel.getContentId())
                .contentsCd(travel.getContentsCd())
                .categoryName(travel.getCategoryName())
                .title(travel.getTitle())
                .introduction(travel.getIntroduction())
                .description(travel.getDescription())
                .address(travel.getAddress())
                .roadAddress(travel.getRoadAddress())
                .phoneNo(travel.getPhoneNo())
                .tag(travel.getTag())
                .longitude(travel.getLongitude())
                .latitude(travel.getLatitude())
                .region1Name(travel.getRegion1Name())
                .region2Name(travel.getRegion2Name())
                .photoId(travel.getPhotoId())
                .imagePath(travel.getImagePath())
                .thumbnailPath(travel.getThumbnailPath())

                // ✅ null-safe 처리 + 증가값 반영
                .views(travel.getViews() != null ? travel.getViews() : 0L)
                .likesCount(likesCount != null ? likesCount : 0L)
                .bookmarkCount(bookmarkCount != null ? bookmarkCount : 0L)

                .state(travel.getState())
                .homepage(travel.getHomepage())
                .parking(travel.getParking())
                .fee(travel.getFee())
                .hours(travel.getHours())

                // ✅ 사용자별 상태
                .isLikedByUser(isLikedByUser)
                .isBookmarkedByUser(isBookmarkedByUser)

                // ✅ LocalDate 변환
                .createdAt(createdAtLDT != null ? createdAtLDT.toLocalDate() : null)
                .updatedAt(updatedAtLDT != null ? updatedAtLDT.toLocalDate() : null)
                .build();
    }

    public static TravelDetailResponseDTO of(Travel travel) {
        return of(travel, 0L, 0L, false, false);
    }

    // 마이페이지 출력용 단순 DTO 변환작업
    public static TravelDetailResponseDTO ofSimple(Travel travel) {
        return TravelDetailResponseDTO.builder()
                .travelId(travel.getTravelId())
                .title(travel.getTitle())
                .region1Name(travel.getRegion1Name())
                .region2Name(travel.getRegion2Name())
                .thumbnailPath(travel.getThumbnailPath())
                .likesCount(travel.getLikesCount() != null ? travel.getLikesCount() : 0L)
                .build();
    }
}
