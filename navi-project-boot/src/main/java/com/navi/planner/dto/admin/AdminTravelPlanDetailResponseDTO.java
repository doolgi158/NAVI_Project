package com.navi.planner.dto.admin;

import com.navi.planner.domain.TravelPlan;

import com.navi.planner.domain.TravelPlanDay;
import com.navi.planner.domain.TravelPlanItem;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTravelPlanDetailResponseDTO {

    private Long planId;
    private String title;
    private String name;
    private String id;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isPublic;
    private List<DayDetailDTO> days;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayDetailDTO {
        private Long dayId;
        private LocalDate date;
        private List<ItemDTO> items;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemDTO {
        private String title;
        private String type; // travel | stay
        private Double lat;
        private Double lng;
        private String time;
    }

    public static AdminTravelPlanDetailResponseDTO of(TravelPlan plan) {
        return AdminTravelPlanDetailResponseDTO.builder()
                .planId(plan.getPlanId())
                .title(plan.getTitle())
                .name(plan.getUser() != null ? plan.getUser().getName() : "알 수 없음")
                .id(plan.getUser() != null ? plan.getUser().getId():"-")
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .days(plan.getDays().stream()
                        .sorted((a, b) -> a.getDayOrder().compareTo(b.getDayOrder()))
                        .map(d -> DayDetailDTO.builder()
                                .dayId(d.getDayId())
                                .date(d.getDate())
                                .items(d.getItems().stream()
                                        .map(i -> ItemDTO.builder()
                                                .title(i.getTitle())
                                                .type(i.getType())
                                                .lat(i.getLat())
                                                .lng(i.getLng())
                                                .time(i.getStartTime() != null ? i.getStartTime().toString() : "")
                                                .build())
                                        .collect(Collectors.toList())) // ✅ Collectors.toList()
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
