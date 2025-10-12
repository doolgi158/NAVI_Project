package com.navi.travel.dto;

import com.navi.travel.domain.Travel;
import lombok.*;

import java.time.LocalDateTime;

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

    /**
     * ✅ 일반 Entity → DTO 변환
     */
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
     * ✅ Native Query (인기순 정렬 결과) 전용 생성자
     *    → Object[] 매핑용
     */
    public TravelListResponseDTO(Long travelId,
                                 String title,
                                 String region1Name,
                                 String region2Name,
                                 String thumbnailPath,
                                 Long likesCount) {
        this.travelId = travelId;
        this.title = title;
        this.region1Name = region1Name;
        this.region2Name = region2Name;
        this.thumbnailPath = thumbnailPath;
        this.likesCount = likesCount;
    }
}
