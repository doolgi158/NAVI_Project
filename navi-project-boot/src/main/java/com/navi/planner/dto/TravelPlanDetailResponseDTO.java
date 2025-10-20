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
    private LocalTime startTime;
    private LocalTime endTime;
    private List<DayDTO> days;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DayDTO {
        private Long id;
        private LocalDate dayDate;
        private Integer orderNo;
        private String planTitle;
        private Long travelId;
        private LocalTime startTime;
        private LocalTime endTime;
        private String stayName;

        public static DayDTO fromEntity(TravelPlanDay day) {
            return DayDTO.builder()
                    .id(day.getId())
                    .dayDate(day.getDayDate())
                    .orderNo(day.getOrderNo())
                    .planTitle(day.getPlanTitle())
                    .travelId(day.getTravelId())
                    .startTime(day.getStartTime())
                    .endTime(day.getEndTime())
                    .stayName(day.getStayName())
                    .build();
        }
    }

    public static TravelPlanDetailResponseDTO fromEntity(TravelPlan plan) {
        return TravelPlanDetailResponseDTO.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .userId(plan.getUser().getId())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .thumbnailPath(plan.getThumbnailPath())
                .startTime(plan.getStartTime())
                .endTime(plan.getEndTime())
                .days(plan.getDays().stream()
                        .map(DayDTO::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }
}
