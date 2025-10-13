package com.navi.user.domain;

import jakarta.persistence.*;
import lombok.*;

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

    @Column(name = "withdraw_request", nullable = false)
    private String request;         // 탈퇴 요청일

    @Column(name = "withdraw_due")
    private String due;     // 탈퇴 예정일

    @Column(name = "withdraw_end", updatable = false)
    private String end;     //  탈퇴 처리일

    @Column(name = "withdraw_reason")
    private String reason;  // 탈퇴 사유
}
