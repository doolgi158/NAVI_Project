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

    private Long planId;        // ✅ 실제 필드명 맞춤
    private String title;
    private String userId;      // ✅ User.id (문자열 로그인 아이디)
    private LocalDate startDate;
    private LocalDate endDate;
    private String thumbnailPath;
    private List<TravelPlanDayDTO> days;

    /** ✅ 일차별 일정 DTO */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TravelPlanDayDTO {
        private Long dayId;
        private LocalDate dayDate;
        private Integer orderNo;
        private List<TravelPlanItemDTO> items;

        public static TravelPlanDayDTO fromEntity(TravelPlanDay day) {
            return TravelPlanDayDTO.builder()
                    .dayId(day.getId())
                    .dayDate(day.getDayDate())
                    .orderNo(day.getOrderNo())
                    .items(List.of(TravelPlanItemDTO.fromEntity(day)))
                    .build();
        }
    }

    /** ✅ 일정 내부의 개별 장소 DTO */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TravelPlanItemDTO {
        private Long itemId;
        private String title;      // planTitle 또는 stayName
        private String type;       // "travel" / "stay"
        private Long travelId;
        private Double lat;
        private Double lng;
        private String img;
        private LocalTime startTime;
        private LocalTime endTime;

        public static TravelPlanItemDTO fromEntity(TravelPlanDay day) {
            boolean isStay = (day.getStayName() != null && !day.getStayName().isEmpty());

            return TravelPlanItemDTO.builder()
                    .itemId(day.getId())
                    .title(isStay ? day.getStayName() : day.getPlanTitle())
                    .type(isStay ? "stay" : "travel")
                    .travelId(day.getTravelId())
                    .lat(day.getLatitude())
                    .lng(day.getLongitude())
                    .img(day.getImagePath())
                    .startTime(day.getStartTime())
                    .endTime(day.getEndTime())
                    .build();
        }
    }

    /** ✅ 엔티티 → DTO 변환 */
    public static TravelPlanDetailResponseDTO of(TravelPlan plan) {
        return TravelPlanDetailResponseDTO.builder()
                .planId(plan.getPlanId())                   // ✅ 필드명 수정
                .title(plan.getTitle())
                .userId(plan.getUser().getId())             // ✅ User.id (문자열 로그인 아이디)
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .thumbnailPath(plan.getThumbnailPath())
                .days(plan.getDays() != null
                        ? plan.getDays().stream()
                        .map(TravelPlanDayDTO::fromEntity)
                        .collect(Collectors.toList())
                        : List.of())
                .build();
    }
}
