package com.navi.planner.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.Objects;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "NAVI_TRAVEL_PLAN_ITEM")
@SequenceGenerator(
        name = "travel_plan_item_seq_gen",
        sequenceName = "TRAVEL_PLAN_ITEM_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class TravelPlanItem {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "travel_plan_item_seq_gen")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id", nullable = false)
    private TravelPlanDay day;

    @Column(length = 300)
    private String title;

    @Column(length = 50)
    private String type; // travel | stay | poi | etc

    @Column(name = "travel_id")
    private Long travelId;

    @Column(name = "stay_id")
    private Long stayId;

    /** 좌표 통합 저장(lat/lng) */
    @Column(name = "lat")
    private Double lat;

    @Column(name = "lng")
    private Double lng;

    @Column(length = 1000)
    private String img;

    @Column(length = 300)
    private String stayName;

    @Column(name = "start_time", length = 20)
    private String startTime;

    @Column(name = "end_time", length = 20)
    private String endTime;

    /* equals/hashCode: 식별자 기반 */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TravelPlanItem)) return false;
        TravelPlanItem that = (TravelPlanItem) o;
        return itemId != null && Objects.equals(itemId, that.itemId);
    }

    @Override
    public int hashCode() {
        return 31;
    }
}
