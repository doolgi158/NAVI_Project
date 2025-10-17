package com.navi.user.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "navi_withdraw")
@SequenceGenerator(
        name = "navi_withdraw_generator",
        sequenceName = "navi_withdraw_seq",
        initialValue = 1,
        allocationSize = 1
)
public class Withdraw {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "navi_withdraw_generator")
    @Column(name = "withdraw_no")
    private long no;                    // 이력 ID

    @Column(name = "withdraw_request_at", updatable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime requestAt;    // 탈퇴 요청일

    @Column(name = "withdraw_due_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dueAt;        // 탈퇴 예정일

    @Column(name = "withdraw_deleted_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime deletedAt;    // 탈퇴 처리일

    @Column(name = "withdraw_reason", length = 500)
    private String reason;              // 탈퇴 사유

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false, unique = true)
    private User user;

    public void markProcessed() {
        this.deletedAt = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
    }

    public static Withdraw create(User user, String reason) {
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        return Withdraw.builder()
                .user(user)
                .requestAt(now)
                .dueAt(now.plusDays(7))
                .reason(reason)
                .build();
    }
}
