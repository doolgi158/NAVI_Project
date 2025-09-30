package com.NAVI_Project.user.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

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

    @Column(name = "log_payment", nullable = false)
    @ColumnDefault(value = "0")
    private int payment;    // 결제 횟수

    @Column(name = "log_refund", nullable = false)
    @ColumnDefault(value = "0")
    private int refund;     // 환불 요청 수

    @Column(name = "log_schedule", nullable = false)
    @ColumnDefault(value = "0")
    private int schedule;   // 계획 작성 수

    @Column(name = "log_delivery", nullable = false)
    @ColumnDefault(value = "0")
    private int delivery;   // 배송 요청 수

    @Column(name = "log_board", nullable = false)
    @ColumnDefault(value = "0")
    private int board;      // 게시글 작숭 수

    @Column(name = "log_comment", nullable = false)
    @ColumnDefault(value = "0")
    private int comment;    // 잿글 작성 수
}
