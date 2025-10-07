package com.navi.user.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.navi.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "navi_try")
@SequenceGenerator(
        name = "navi_try_generator",
        sequenceName = "navi_try_seq",
        initialValue = 1,
        allocationSize = 1
)
public class TryLogin extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "navi_try_generator")
    @Column(name = "try_id")
    private Long tryid;     // 시도 아이디

    @Column(name = "try_count", nullable = false)
    @ColumnDefault(value = "0")
    private int count;      // 시도 횟수

    @Column(name = "try_state", nullable = false, length = 1)
    @ColumnDefault(value = "'F'")
    private char state;     // 성공 여부

    @Column(name = "try_time", nullable = false)
    @ColumnDefault(value = "Sysdate")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime time;    // 로그인시도 시간

    @Column(name = "try_ip", nullable = false)
    private String ip;      // 요청한 PC의 IP

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private User user;        // 사용자 번호

    // 실패 시 카운트 증가
    public void increaseCount() {
        this.count++;
        this.state = 'F';
        this.time = LocalDateTime.now();
    }

    // 성공 시 상태 변경
    public void trySuccess() {
        this.state = 'T';
        this.count = 0;
        this.time = LocalDateTime.now();
    }
}
