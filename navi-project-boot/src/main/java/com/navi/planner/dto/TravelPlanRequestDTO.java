package com.navi.planner.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * 여행계획 등록/수정 요청 DTO
 * 프론트엔드에서 days[].items[] 구조로 전달받는 데이터를 매핑한다.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelPlanRequestDTO {

    /** 메인 정보 */
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String thumbnailPath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    /** 일자별 일정 리스트 */
    private List<DayRequestDTO> days;



    /** 하루 단위 일정 DTO */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayRequestDTO {
        private LocalDate dayDate;
        private Integer orderNo;
        private List<ItemRequestDTO> items;
    }

    /** 일자별 아이템(여행지/숙소 등) DTO */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemRequestDTO {
        private String title;
        private String type;        // "travel" | "stay" | "etc"

        private Long travelId;
        private Long stayId;
        private String stayName;

        /** ✅ 위치 정보 (API 별 필드 통합 대응) */
        private Double lat;         // 기본 latitude
        private Double lng;         // 기본 longitude
        private Double latitude;    // 여행지용 (travel API)
        private Double longitude;   // 여행지용 (travel API)
        private Double mapY;        // 숙소용 (stay API)
        private Double mapX;        // 숙소용 (stay API)

        private String img;
        private String startTime;
        private String endTime;

        @Builder.Default
        private boolean deleted = false;

    }
}
