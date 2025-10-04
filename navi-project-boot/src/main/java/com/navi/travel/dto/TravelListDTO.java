package com.navi.travel.dto;

import com.navi.travel.domain.Travel;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class TravelListDTO {

    private Long travelId;          // 여행지 ID
    private String title;           // 여행지 제목
    private String region1Name;     //시명
    private String region2Name;     //읍명
    private String thumbnailPath;   // 서브사진경로 (목록에서 사용)
    private Long views;             // 조회수
    private Long likes;             // 좋아요 수
    private LocalDateTime updatedAt;    //수정일 (최신순 기준정렬시 필요)

    public TravelListDTO(Travel travel) {
        this.travelId = travel.getTravelId();
        this.title = travel.getTitle();
        this.region1Name = travel.getRegion1Name();
        this.region2Name = travel.getRegion2Name();
        this.thumbnailPath = travel.getThumbnailPath();
        this.views = travel.getViews();
        this.likes = travel.getLikes();
        this.updatedAt = travel.getUpdatedAt(); // BaseEntity 상속 필드
    }

}
