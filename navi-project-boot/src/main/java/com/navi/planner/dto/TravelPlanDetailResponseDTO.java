package com.navi.planner.dto;

import com.navi.planner.domain.TravelPlan;
import com.navi.planner.domain.TravelPlanDay;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlanDetailResponseDTO {

    private Long id;
    private String title;
    private String userId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String thumbnailPath;
    private List<TravelPlanDayDTO> days;

    /** ✅ 일차별 일정 DTO */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TravelPlanDayDTO {
        private Long id;
        private LocalDate dayDate;
        private Integer orderNo;
        private List<TravelPlanItemDTO> items;

        public static TravelPlanDayDTO fromEntity(TravelPlanDay day) {
            // 현재 TravelPlanDay에는 단일 travelId/stayName만 있으므로 items는 1개짜리 리스트로 생성
            return TravelPlanDayDTO.builder()
                    .id(day.getId())
                    .dayDate(day.getDayDate())
                    .orderNo(day.getOrderNo())
                    .items(List.of(TravelPlanItemDTO.fromEntity(day)))
                    .build();
        }
    }

    /** ✅ 일정 내부의 개별 장소 DTO */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TravelPlanItemDTO {
        private Long id;
        private String title;      // planTitle 또는 stayName
        private String type;       // "travel" / "stay"
        private Long travelId;
        private Double lat;
        private Double lng;
        private String img;
        private LocalTime startTime;
        private LocalTime endTime;

        public static TravelPlanItemDTO fromEntity(TravelPlanDay day) {
            boolean isStay = (day.getStayName() != null && !day.getStayName().isEmpty());

            return TravelPlanItemDTO.builder()
                    .id(day.getId())
                    .title(isStay ? day.getStayName() : day.getPlanTitle())
                    .type(isStay ? "stay" : "travel")
                    .travelId(day.getTravelId())
                    .lat(day.getLatitude())     // 아직 구현되지 않은 메서드지만, null 허용 가능
                    .lng(day.getLongitude())
                    .img(day.getImagePath())
                    .startTime(day.getStartTime())
                    .endTime(day.getEndTime())
                    .build();
        }
    }

    /** ✅ 엔티티 → DTO 변환 */
    public static TravelPlanDetailResponseDTO fromEntity(TravelPlan plan) {
        return TravelPlanDetailResponseDTO.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .userId(plan.getUser().getId())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .thumbnailPath(plan.getThumbnailPath())
                .days(plan.getDays().stream()
                        .map(TravelPlanDayDTO::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }
}
