package com.navi.travel.dto.admin;

import com.navi.travel.domain.Travel;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTravelRequestDTO {

    private Long travelId;
    private String contentId;
    private String title;
    private String categoryName;
    private String introduction;
    private String description;
    private String region1Name;
    private String region2Name;
    private String address;
    private String roadAddress;
    private Double longitude;
    private Double latitude;
    private String imagePath;
    private String thumbnailPath;
    private String tag;
    private String phoneNo;
    private String homepage;
    private String parking;
    private String fee;
    private String hours;
    private int state;

    public Travel toEntity() {
        return Travel.builder()
                .travelId(travelId)
                .contentId(contentId)
                .title(title)
                .categoryName(categoryName)
                .introduction(introduction)
                .description(description)
                .region1Name(region1Name)
                .region2Name(region2Name)
                .address(address)
                .roadAddress(roadAddress)
                .longitude(longitude)
                .latitude(latitude)
                .imagePath(imagePath)  // ✅ 대표 이미지 반영
                .thumbnailPath(thumbnailPath)
                .tag(tag)
                .phoneNo(phoneNo)
                .homepage(homepage)
                .parking(parking)
                .fee(fee)
                .hours(hours)
                .state(state)
                .build();
    }

}
