package com.navi.planner.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlanListResponseDTO {

    private Long id;
    private String title;
    private String thumbnailPath;
    private LocalDate startDate;
    private LocalDate endDate;
    private String summary;

    // ✅ 엔티티 -> DTO 변환 헬퍼
    public static TravelPlanListResponseDTO fromEntity(com.navi.planner.domain.TravelPlan plan) {
        return TravelPlanListResponseDTO.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .thumbnailPath(plan.getThumbnailPath())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .summary(plan.getSummary())
                .build();
    }
}
