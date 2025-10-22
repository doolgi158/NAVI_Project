package com.navi.planner.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "TRAVEL_PLAN_DAY", schema = "NAVI")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlanDay {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "travel_plan_day_seq")
    @SequenceGenerator(
            name = "travel_plan_day_seq",
            sequenceName = "TRAVEL_PLAN_DAY_SEQ",
            allocationSize = 1
    )
    private Long id;

    /** ✅ FK: TRAVEL_PLAN.id 참조 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private TravelPlan travelPlan;

    @Column(name = "day_date", nullable = false)
    private LocalDate dayDate;

    @Column(name = "order_no", nullable = false)
    private Integer orderNo;

    @Column(name = "plan_title", nullable = false)
    private String planTitle;

    @Column(name = "travel_id")
    private Long travelId; // TRAVEL.TRAVEL_ID 참조 값 (숫자)

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "stay_name")
    private String stayName;

    public String getImagePath() {
        return null;
    }

    public Double getLongitude() {
        return null;
    }

    public Double getLatitude() {
        return null;
    }
}