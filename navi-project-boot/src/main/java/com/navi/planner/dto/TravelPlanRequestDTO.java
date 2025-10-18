package com.navi.planner.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlanRequestDTO {
    private String title;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    private String thumbnailPath;

    private List<TravelItem> travels;
    private List<StayItem> stays;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TravelItem {
        private Long travelId;
        private String travelName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StayItem {
        private Long stayId;
        private String stayName;
        private List<String> dates;
    }
}


