package com.navi.planner.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "NAVI_TRAVEL_PLAN_DAY")
@SequenceGenerator(
        name = "travel_plan_day_seq_gen",
        sequenceName = "TRAVEL_PLAN_DAY_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class TravelPlanDay {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "travel_plan_day_seq_gen")
    private Long dayId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    @JsonBackReference
    private TravelPlan travelPlan;

    @Column(name = "day_date", nullable = false)
    private LocalDate dayDate;

    @Column(name = "order_no", nullable = false)
    private Integer orderNo;

    /** ✅ 하위 아이템 관계  */
    @OneToMany(mappedBy = "day", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @OrderBy("startTime ASC")
    @Builder.Default
    private Set<TravelPlanItem> items = new LinkedHashSet<>();

    /* ===== 편의 메서드 ===== */
    public void addItem(TravelPlanItem item) {
        if (item == null) return;
        item.setDay(this);
        this.items.add(item);
    }

    public void replaceItems(Set<TravelPlanItem> newItems) {
        this.items.clear();
        if (newItems != null) {
            newItems.forEach(i -> i.setDay(this));
            this.items.addAll(newItems);
        }
    }

    /* ✅ 삭제 관련 메서드 제거 (JPA orphanRemoval이 자동 처리) */

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TravelPlanDay)) return false;
        TravelPlanDay that = (TravelPlanDay) o;
        return dayId != null && Objects.equals(dayId, that.dayId);
    }

    @Override
    public int hashCode() {
        return 31;
    }
}
