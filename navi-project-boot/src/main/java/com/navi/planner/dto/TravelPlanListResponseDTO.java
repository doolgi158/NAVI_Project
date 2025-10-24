package com.navi.planner.dto;

import com.navi.planner.domain.TravelPlan;
import com.navi.planner.domain.TravelPlanDay;
import lombok.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelPlanListResponseDTO {

    private Long planId;
    private String title;
    private String userId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String thumbnailPath;
    private int totalDays;
    private Set<String> travelTitles; // 여행지 이름 요약용

    public static TravelPlanListResponseDTO fromEntity(TravelPlan plan) {
        return TravelPlanListResponseDTO.builder()
                .planId(plan.getPlanId())
                .title(plan.getTitle())
                .userId(plan.getUser().getId())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .thumbnailPath(plan.getThumbnailPath())
                .totalDays(plan.getDays() != null ? plan.getDays().size() : 0)
                .travelTitles(plan.getDays() != null
                        ? plan.getDays().stream()
                        .flatMap(day -> day.getItems().stream())
                        .filter(item -> "travel".equals(item.getType()))
                        .map(item -> item.getTitle())
                        .limit(3)
                        .collect(Collectors.toSet())
                        : Collections.emptySet())
                .build();
    }
}
