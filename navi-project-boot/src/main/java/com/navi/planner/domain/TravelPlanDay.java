package com.navi.planner.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "travel_plan_day")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TravelPlanDay {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "travel_plan_day_seq")
    @SequenceGenerator(name = "travel_plan_day_seq", sequenceName = "TRAVEL_PLAN_DAY_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private TravelPlan travelPlan;

    @Column(name = "day_date", nullable = false)
    private LocalDate dayDate;

    @Column(name = "order_no", nullable = false)
    private Integer orderNo; // 순서 (1,2,3...)

    @Column(name = "plan_title", nullable = false)
    private String planTitle; // 여행지명 또는 일정 타이틀

    @Column(name = "travel_content_id")
    private Long travelContentId; // 여행지 ID (Travel.contentId)

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "stay_name")
    private String stayName; // 숙소명 (선택)
}
