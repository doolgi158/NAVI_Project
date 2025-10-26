package com.navi.planner.dto.admin;

import com.navi.planner.domain.TravelPlan;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTravelPlanListResponseDTO {

    private Long planId;
    private String title;
    private String userId;
    private String userName;
    private LocalDate startDate;
    private LocalDate endDate;
    private int dayCount;;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminTravelPlanListResponseDTO of(TravelPlan plan) {
        return AdminTravelPlanListResponseDTO.builder()
                .planId(plan.getPlanId())
                .title(plan.getTitle())
                .userId(plan.getUser() != null ? plan.getUser().getId(): "알 수 없음")
                .userName(plan.getUser() != null ? plan.getUser().getName() : "알 수 없음")
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .dayCount(plan.getDays() != null ? plan.getDays().size() : 0)
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}
