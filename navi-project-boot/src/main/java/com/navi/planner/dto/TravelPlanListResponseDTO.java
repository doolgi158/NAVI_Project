package com.navi.planner.dto;

import com.navi.planner.domain.TravelPlan;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlanListResponseDTO {

    private Long id;
    private String title;
    private String userId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String thumbnailPath;
    private LocalTime startTime;
    private LocalTime endTime;

    public static TravelPlanListResponseDTO fromEntity(TravelPlan plan) {
        return TravelPlanListResponseDTO.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .userId(plan.getUser().getId())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .thumbnailPath(plan.getThumbnailPath())
                .startTime(plan.getStartTime())
                .endTime(plan.getEndTime())
                .build();
    }
}
