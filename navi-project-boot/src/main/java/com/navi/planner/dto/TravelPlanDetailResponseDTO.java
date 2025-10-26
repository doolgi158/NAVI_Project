package com.navi.planner.dto;

import com.navi.planner.domain.TravelPlan;
import com.navi.planner.domain.TravelPlanDay;
import com.navi.planner.domain.TravelPlanItem;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelPlanDetailResponseDTO {

    private Long planId;
    private String title;
    private String userId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String thumbnailPath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TravelPlanDayDTO> days;


    /** 하루별 DTO */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TravelPlanDayDTO {
        private Long dayId;
        private LocalDate dayDate;
        private Integer orderNo;
        private List<TravelPlanItemDTO> items;
    }

    /** 아이템 DTO */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TravelPlanItemDTO {
        private Long itemId;
        private String title;
        private String type;
        private Long travelId;
        private Long stayId;
        private Double lat;
        private Double lng;
        private String img;
        private String stayName;
        private String startTime;
        private String endTime;


    }

    public static TravelPlanDetailResponseDTO fromEntity(TravelPlan plan) {
        List<TravelPlanDayDTO> dayDTOs = plan.getDays().stream()
                .sorted(Comparator.comparing(TravelPlanDay::getOrderNo))
                .map(day -> TravelPlanDayDTO.builder()
                        .dayId(day.getDayId())
                        .dayDate(day.getDayDate())
                        .orderNo(day.getOrderNo())
                        .items(day.getItems().stream()
                                .sorted(Comparator.comparing(TravelPlanItem::getItemId))
                                .map(it -> TravelPlanItemDTO.builder()
                                        .itemId(it.getItemId())
                                        .title(it.getTitle())
                                        .type(it.getType())
                                        .travelId(it.getTravelId())
                                        .stayId(it.getStayId())
                                        .stayName(it.getStayName())
                                        .startTime(it.getStartTime())
                                        .endTime(it.getEndTime())
                                        .img(it.getImg())
                                        // ✅ 위경도 처리 (travel/stay 필드명 혼용 대응)
                                        .lat(it.getLat() != null ? it.getLat() : null)
                                        .lng(it.getLng() != null ? it.getLng() : null)
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        return TravelPlanDetailResponseDTO.builder()
                .planId(plan.getPlanId())
                .title(plan.getTitle())
                .userId(plan.getUser() != null ? plan.getUser().getId() : null)
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .thumbnailPath(plan.getThumbnailPath())
                .days(dayDTOs)
                .build();
    }
}
