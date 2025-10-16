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

    @Column(name = "withdraw_id", nullable = false)
    private String userId;              // 유저의 id

    @Column(name = "withdraw_email", nullable = false)
    private String email;               // 유저의 이메일

    @Column(name = "withdraw_phone", nullable = false)
    private String phone;               // 유저의 연락처

    @Column(name = "withdraw_ip", nullable = false)
    private String ip;                  // 유저의 ip

    @Column(name = "withdraw_deleted_at", updatable = false, columnDefinition = "TIMESTAMP(0)")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime  deletedAt;   //  탈퇴일

    @Column(name = "withdraw_reason", length = 500)
    private String reason;             // 탈퇴 사유

    public void markProcessed() {
        this.deletedAt = LocalDateTime.now();
    }
}
