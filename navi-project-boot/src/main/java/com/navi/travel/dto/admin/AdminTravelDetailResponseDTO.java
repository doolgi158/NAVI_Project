package com.navi.travel.dto.admin;

import com.navi.travel.domain.Travel;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTravelDetailResponseDTO {

    private Long travelId;
    private String contentId;
    private String contentsCd;
    private String categoryName;

    private String title;
    private String introduction;

    /** ✅ 리치 텍스트 본문 (react-quill HTML 내용) */
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

    private int state;

    private String homepage;
    private String parking;
    private String fee;
    private String hours;

    private Long views;
    private Long likesCount;
    private Long bookmarkCount;

    /** ✅ 관리자 확인용: 등록일 / 수정일 */
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminTravelDetailResponseDTO of(Travel t) {
        return AdminTravelDetailResponseDTO.builder()
                .travelId(t.getTravelId())
                .contentId(t.getContentId())
                .contentsCd(t.getContentsCd())
                .categoryName(t.getCategoryName())
                .title(t.getTitle())
                .introduction(t.getIntroduction())
                .description(t.getDescription())
                .address(t.getAddress())
                .roadAddress(t.getRoadAddress())
                .phoneNo(t.getPhoneNo())
                .tag(t.getTag())
                .longitude(t.getLongitude())
                .latitude(t.getLatitude())
                .region1Name(t.getRegion1Name())
                .region2Name(t.getRegion2Name())
                .photoId(t.getPhotoId())
                .imagePath(t.getImagePath())
                .thumbnailPath(t.getThumbnailPath())
                .state(t.getState())
                .homepage(t.getHomepage())
                .parking(t.getParking())
                .fee(t.getFee())
                .hours(t.getHours())
                .views(t.getViews() != null ? t.getViews() : 0L)
                .likesCount(t.getLikesCount() != null ? t.getLikesCount() : 0L)
                .bookmarkCount(t.getBookmarkCount() != null ? t.getBookmarkCount() : 0L)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
