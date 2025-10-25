package com.navi.travel.dto;

import com.navi.travel.domain.Travel;
import jakarta.persistence.Column;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelSimpleResponseDTO {

    private Long travelId;        // 여행지 PK
    private String title;    // 여행지명
    private String region1Name;     //시명
    private String region2Name;     //읍명
    private String img;     // 대표 이미지
    private Double lat;     // 위도
    private Double lng;     // 경도
    private Long likes;      // 좋아요 수
    private String categoryName;     //카테고리이름

    // ✅ 엔티티 → DTO 변환자
    public TravelSimpleResponseDTO(Travel entity) {
        this.travelId = entity.getTravelId();
        this.region1Name = entity.getRegion1Name();
        this.region2Name = entity.getRegion2Name();
        this.categoryName = entity.getCategoryName();
        this.title = entity.getTitle();
        this.img = entity.getImagePath();
        this.lat = entity.getLatitude();
        this.lng = entity.getLongitude();
        this.likes = entity.getLikes() != null ? entity.getLikesCount() : 0;
    }
}
