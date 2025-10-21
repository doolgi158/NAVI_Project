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
public class TravelPlanListResponseDTO {

    private Long planId;
    private String title;
    private String userId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String thumbnailPath;
    private LocalTime startTime;
    private LocalTime endTime;
    private List<String> travels;

    public static TravelPlanListResponseDTO of(TravelPlan plan) {


        List<String> travelTitles = plan.getDays() != null
                ? plan.getDays().stream()
                .map(TravelPlanDay::getPlanTitle)
                .filter(title -> title != null && !title.isBlank())
                .limit(5) // 최대 5개만 요약으로
                .collect(Collectors.toList())
                : List.of();

        return TravelPlanListResponseDTO.builder()
                .planId(plan.getPlanId())
                .title(plan.getTitle())
                .userId(plan.getUser().getId())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .thumbnailPath(plan.getThumbnailPath())
                .startTime(plan.getStartTime())
                .endTime(plan.getEndTime())
                .travels(travelTitles)
                .build();
    }
}