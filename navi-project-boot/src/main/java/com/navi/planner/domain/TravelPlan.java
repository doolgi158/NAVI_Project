package com.navi.planner.domain;

import com.navi.common.entity.BaseEntity;
import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "TRAVEL_PLAN", schema = "NAVI")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlan extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "travel_plan_seq")
    @SequenceGenerator(name = "travel_plan_seq", sequenceName = "TRAVEL_PLAN_SEQ", allocationSize = 1)
    private Long id;

    /**
     * NOTE:
     *  - 컬럼명은 user_id 지만, 실제로는 User의 PK(user_no)를 참조한다.
     *  - 혼동 방지를 위해 referencedColumnName 명시
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_no", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(length = 500)
    private String thumbnailPath;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderNo ASC, id ASC")
    @Builder.Default
    private List<TravelPlanDay> days = new ArrayList<>();

    public void setDays(List<TravelPlanDay> days) {
        this.days = days;
        if (days != null) {
            for (TravelPlanDay d : days) {
                d.setTravelPlan(this);
            }
        }
    }
}
