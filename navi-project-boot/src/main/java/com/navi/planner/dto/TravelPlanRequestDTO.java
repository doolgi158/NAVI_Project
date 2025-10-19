package com.navi.planner.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.OptBoolean;
import org.springframework.format.annotation.DateTimeFormat;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlanRequestDTO {

    private String userId;
    private String title;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @JsonFormat(pattern = "HH:mm:ss", lenient = OptBoolean.TRUE)
    @DateTimeFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm:ss", lenient = OptBoolean.TRUE)
    @DateTimeFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    private String thumbnailPath;

    @Builder.Default
    private List<TravelItem> travels = new ArrayList<>();

    @Builder.Default
    private List<StayItem> stays = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TravelItem {
        private Long travelId;
        private String travelName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StayItem {
        private String stayId;
        private String stayName;

        @Builder.Default
        private List<String> dates = new ArrayList<>();
    }
}
