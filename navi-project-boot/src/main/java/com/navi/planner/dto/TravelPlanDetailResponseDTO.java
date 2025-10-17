package com.navi.planner.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlanDetailResponseDTO {

    private Long id;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private String thumbnailPath;
    private String summary;
    private List<DayItem> days;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DayItem {
        private LocalDate dayDate;
        private Integer orderNo;
        private String planTitle;
        private Long travelContentId;
        private String stayName;
        private LocalTime startTime;
        private LocalTime endTime;
    }

    // ✅ 엔티티 -> DTO 변환
    public static TravelPlanDetailResponseDTO fromEntity(com.navi.planner.domain.TravelPlan plan) {
        return TravelPlanDetailResponseDTO.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .thumbnailPath(plan.getThumbnailPath())
                .summary(plan.getSummary())
                .days(plan.getDays().stream()
                        .map(d -> DayItem.builder()
                                .dayDate(d.getDayDate())
                                .orderNo(d.getOrderNo())
                                .planTitle(d.getPlanTitle())
                                .travelContentId(d.getTravelContentId())
                                .stayName(d.getStayName())
                                .startTime(d.getStartTime())
                                .endTime(d.getEndTime())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
