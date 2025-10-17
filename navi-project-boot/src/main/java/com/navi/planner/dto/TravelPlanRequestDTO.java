package com.navi.planner.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlanRequestDTO {

    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private String summary;
    private String thumbnailPath;
    private List<PlanItem> planItems;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PlanItem {
        private LocalDate dayDate;
        private Long travelContentId;
        private String planTitle;
        private String stayName;
        private LocalTime startTime;
        private LocalTime endTime;
    }
}
