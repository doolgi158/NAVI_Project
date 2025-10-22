package com.navi.user.domain;

import com.navi.user.enums.ActionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "navi_log")
@SequenceGenerator(
        name = "navi_log_generator",
        sequenceName = "navi_log_seq",
        initialValue = 1,
        allocationSize = 1
)
public class Log {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "navi_log_generator")
    @Column(name = "log_ID")
    private long ID;        // 로그 아이디

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private User user;      // 유저 정보

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", length = 50, nullable = false)
    private ActionType actionType;  // 행동 타입

    @Column(name = "target_id", nullable = false)
    private Long targetId;  // 대상 ID

    @Column(name = "target_name", length = 100)
    private String targetName;  // 대상명 (옵션 — 분석용으로 남겨도 좋음)


    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;    // 발생 시각
}
