package com.navi.travel.dto.admin;

import com.navi.travel.domain.Travel;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminTravelListResponseDTO {

    private Long travelId;
    private String contentId;
    private String title;
    private String categoryName;
    private String region1;
    private String region2;
    private String address;
    private String imagePath;
    private int state;
    private int views;
    private int likeCount;
    private int bookmarkCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminTravelListResponseDTO of(Travel t) {
        return AdminTravelListResponseDTO.builder()
                .travelId(t.getTravelId())
                .contentId(t.getContentId())
                .title(t.getTitle())
                .categoryName(t.getCategoryName())
                .region1(t.getRegion1Name())
                .region2(t.getRegion2Name())
                .address(t.getAddress())
                .imagePath(t.getImagePath())
                .state(t.getState())
                .views(Math.toIntExact(t.getViews()))
                .likeCount(t.getLikes().size())
                .bookmarkCount(t.getBookmarks().size())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
