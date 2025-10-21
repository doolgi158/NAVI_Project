package com.navi.planner.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/* =====[NAVI_TRAVEL_PLAN]=====
        여행계획 메인 테이블
   ============================== */

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@DynamicUpdate
@Table(name = "NAVI_TRAVEL_PLAN")
@SequenceGenerator(
        name = "travel_plan_seq_gen",
        sequenceName = "TRAVEL_PLAN_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class TravelPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "travel_plan_seq_gen")
    private Long id;

    // === 관계 ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no")
    private User user;

    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<TravelPlanDay> days = new ArrayList<>();

    // === 기본 정보 ===
    private String title;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "thumbnail_path", length = 1000)
    private String thumbnailPath;

    // === 편의 메서드 ===
    public void setDays(List<TravelPlanDay> newDays) {
        this.days.clear();
        if (newDays != null) {
            newDays.forEach(day -> day.setTravelPlan(this));
            this.days.addAll(newDays);
        }
    }

    /** ✅ 수정용 편의 메서드 (updatePlanInfo) */
    public void updatePlanInfo(String title,
                               LocalDate startDate,
                               LocalDate endDate,
                               LocalTime startTime,
                               LocalTime endTime,
                               String thumbnailPath) {
        if (title != null) this.title = title;
        if (startDate != null) this.startDate = startDate;
        if (endDate != null) this.endDate = endDate;
        if (startTime != null) this.startTime = startTime;
        if (endTime != null) this.endTime = endTime;
        if (thumbnailPath != null) this.thumbnailPath = thumbnailPath;
    }

    /** ✅ Days 추가용 */
    public void addDay(TravelPlanDay day) {
        this.days.add(day);
        day.setTravelPlan(this);
    }

    /** ✅ Days 전체 교체용 */
    public void replaceDays(List<TravelPlanDay> newDays) {
        this.days.clear();
        if (newDays != null) {
            newDays.forEach(d -> d.setTravelPlan(this));
            this.days.addAll(newDays);
        }
    }
}
