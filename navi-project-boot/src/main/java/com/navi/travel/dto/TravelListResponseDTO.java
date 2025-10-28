package com.navi.travel.dto;

import com.navi.travel.domain.Travel;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 여행지 목록 응답 DTO
 * - 일반 목록 (엔티티 변환용)
 * - 인기순 목록 (Native Query 매핑용)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelListResponseDTO {

    private Long travelId;
    private String contentId;
    private String title;
    private String categoryName;
    private String region1;
    private String region2;
    private Double longitude;
    private Double latitude;
    private String tag;
    private String phoneNo;
    private Long photoId;
    private String imagePath;
    private String thumbnailPath;
    private Long Views;
    private Long likesCount;
    private Long bookmarkCount;
    private int state;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;

    // ✅ 프론트 표시용
    private boolean likedByUser;
    private boolean bookmarkedByUser;

    /**
     * ✅ 기본 Entity → DTO 변환
     */
    public static TravelListResponseDTO of(Travel travel) {
        return TravelListResponseDTO.builder()
                .travelId(travel.getTravelId())
                .contentId(travel.getContentId())
                .title(travel.getTitle())
                .categoryName(travel.getCategoryName())
                .region1(travel.getRegion1Name())
                .region2(travel.getRegion2Name())
                .longitude(travel.getLongitude())
                .latitude(travel.getLatitude())
                .phoneNo(travel.getPhoneNo())
                .tag(travel.getTag())
                .photoId(travel.getPhotoId())
                .imagePath(travel.getImagePath())
                .thumbnailPath(travel.getThumbnailPath())
                .Views(travel.getViews() != null ? travel.getViews() : 0L)
                .likesCount(travel.getLikesCount() != null ? travel.getLikesCount() : 0L)
                .bookmarkCount(travel.getBookmarkCount() != null ? travel.getBookmarkCount() : 0L)
                .state(travel.getState())
                .updatedAt(travel.getUpdatedAt())
                .createdAt(travel.getCreatedAt())
                .likedByUser(false)
                .bookmarkedByUser(false)
                .build();
    }

    /**
     * ✅ Native Query 전용 생성자
     *    (좋아요순 / 인기순 전용)
     */
    public TravelListResponseDTO(
            Long travelId,
            String title,
            String region1,
            String region2,
            String imagePath,
            String thumbnailPath,
            Long Views,
            Long likesCount,
            Long bookmarkCount
    ) {
        this.travelId = travelId;
        this.title = title;
        this.region1 = region1;
        this.region2 = region2;
        this.imagePath = imagePath;
        this.thumbnailPath = thumbnailPath;
        this.Views = Views;
        this.likesCount = likesCount;
        this.bookmarkCount = bookmarkCount;
    }
}
