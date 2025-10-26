package com.navi.planner.dto.admin;

import com.navi.planner.domain.TravelPlan;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTravelPlanListResponseDTO {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");


    private Long planId;
    private String title;
    private String userId;
    private String userName;
    private LocalDate startDate;
    private LocalDate endDate;
    private int dayCount;;
    private String createdAt;
    private String updatedAt;

    public static AdminTravelPlanListResponseDTO of(TravelPlan plan) {

        String formattedCreatedAt = plan.getCreatedAt() != null ?
                plan.getCreatedAt().format(DATE_TIME_FORMATTER) : null;
        String formattedUpdatedAt = plan.getUpdatedAt() != null ?
                plan.getUpdatedAt().format(DATE_TIME_FORMATTER) : null;


        return AdminTravelPlanListResponseDTO.builder()
                .planId(plan.getPlanId())
                .title(plan.getTitle())
                .userId(plan.getUser() != null ? plan.getUser().getId(): "알 수 없음")
                .userName(plan.getUser() != null ? plan.getUser().getName() : "알 수 없음")
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .dayCount(plan.getDays() != null ? plan.getDays().size() : 0)
                .createdAt(formattedCreatedAt)
                .updatedAt(formattedUpdatedAt)
                .build();
    }
}
