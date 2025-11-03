package com.navi.planner.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.navi.common.entity.BaseEntityNoAudit;
import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
//@EntityListeners(TravelEntityListener.class)
@DynamicUpdate
@Table(name = "NAVI_TRAVEL_PLAN")
@SequenceGenerator(
        name = "travel_plan_seq_gen",
        sequenceName = "TRAVEL_PLAN_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class TravelPlan extends BaseEntityNoAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "travel_plan_seq_gen")
    private Long planId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private User user;

    /**
     * ✅ 하루 일정들 (Day)
     */
    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    @OrderBy("dayDate ASC, orderNo ASC")
    private Set<TravelPlanDay> days = new LinkedHashSet<>();

    private String title;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "thumbnail_path", length = 1000)
    private String thumbnailPath;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    /* ===== 편의 메서드 ===== */
    // @CreationTimestamp, @UpdateTimestamp를 사용하고 있으므로 @PrePersist/@PreUpdate는 제거하거나 내용 변경
    @PrePersist
    public void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now(); // UpdatedAt은 항상 갱신
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * ✅ 하루 추가
     */
    public void addDay(TravelPlanDay day) {
        if (day == null) return;
        day.setTravelPlan(this);
        this.days.add(day);
    }

    /**
     * ✅ 전체 교체
     */
    public void replaceDays(Set<TravelPlanDay> newDays) {
        this.days.clear();
        if (newDays != null) {
            newDays.forEach(d -> d.setTravelPlan(this));
            this.days.addAll(newDays);
        }
    }

    /**
     * ✅ 계획 기본정보 수정 (createdAt, updatedAt 필드 제거)
     */
    public void updatePlanInfo(String title, LocalDate startDate, LocalDate endDate,
                               LocalTime startTime, LocalTime endTime, String thumbnailPath) {
        if (title != null) this.title = title;
        if (startDate != null) this.startDate = startDate;
        if (endDate != null) this.endDate = endDate;
        if (thumbnailPath != null) this.thumbnailPath = thumbnailPath;

    }

    /* ✅ 삭제 관련 메서드 불필요 → removeAllDays() 제거 (JPA cascade가 처리) */

    /* ===== equals/hashCode ===== */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TravelPlan)) return false;
        TravelPlan that = (TravelPlan) o;
        return planId != null && Objects.equals(planId, that.planId);
    }

    @Override
    public int hashCode() {
        return 31;
    }
}