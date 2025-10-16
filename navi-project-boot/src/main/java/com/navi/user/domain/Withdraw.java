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
    @Column(name = "withdraw_id")
    private long id;                // 이력 ID

    @Column(name = "withdraw_request", nullable = false, columnDefinition = "TIMESTAMP(0)")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime request;  // 탈퇴 요청일

    @Column(name = "withdraw_due", columnDefinition = "TIMESTAMP(0)")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime  due;     // 탈퇴 예정일

    @Column(name = "withdraw_end", updatable = false, columnDefinition = "TIMESTAMP(0)")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime  end;     //  탈퇴 처리일

    @Column(name = "withdraw_reason", length = 500)
    private String reason;          // 탈퇴 사유

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private User user;

    public static Withdraw create(User user, String reason) {
        return Withdraw.builder()
                .user(user)
                .reason(reason)
                .request(LocalDateTime.now())
                .end(LocalDateTime.now())
                .build();
    }

    public void markProcessed() {
        this.end = LocalDateTime.now();
    }
}
