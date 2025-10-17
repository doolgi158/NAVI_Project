package com.navi.planner.domain;

import com.navi.common.entity.BaseEntity;
import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "travel_plan")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TravelPlan extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "travel_plan_seq")
    @SequenceGenerator(name = "travel_plan_seq", sequenceName = "TRAVEL_PLAN_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title; // 여행 제목

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(length = 500)
    private String thumbnailPath; // 대표 사진

    @Column(length = 2000)
    private String summary; // 대표 여행지나 요약 정보

    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TravelPlanDay> days = new ArrayList<>();
}
