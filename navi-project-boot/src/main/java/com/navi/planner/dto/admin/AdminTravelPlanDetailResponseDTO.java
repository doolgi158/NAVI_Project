package com.navi.planner.dto.admin;

import com.navi.planner.domain.TravelPlan;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private String thumbnailPath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
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
        private Long itemId;
        private String title;
        private String type; // travel | stay
        private Double lat;
        private Double lng;
        private String startTime;
        private String endTime;
        private String img; // ✅ 이름 변경 (thumbnailPath → img)
    }

    public static AdminTravelPlanDetailResponseDTO of(TravelPlan plan) {
        return AdminTravelPlanDetailResponseDTO.builder()
                .planId(plan.getPlanId())
                .title(plan.getTitle())
                .name(plan.getUser() != null ? plan.getUser().getName() : "알 수 없음")
                .id(plan.getUser() != null ? plan.getUser().getId() : "-")
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .thumbnailPath(plan.getThumbnailPath())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .days(plan.getDays().stream()
                        .sorted((a, b) -> a.getDayOrder().compareTo(b.getDayOrder()))
                        .map(d -> DayDetailDTO.builder()
                                .dayId(d.getDayId())
                                .date(d.getDate())
                                .items(d.getItems().stream()
                                        .map(i -> ItemDTO.builder()
                                                .itemId(i.getItemId())
                                                .title(i.getTitle())
                                                .type(i.getType())
                                                .lat(i.getLat())
                                                .lng(i.getLng())
                                                .startTime(i.getStartTime() != null ? i.getStartTime() : "")
                                                .endTime(i.getEndTime() != null ? i.getEndTime() : "")
                                                .img(i.getImg()) // ✅ 실제 엔티티의 img 필드 매핑
                                                .build())
                                        .collect(Collectors.toList()))
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
