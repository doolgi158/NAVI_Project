package com.navi.user.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "navi_history")
@SequenceGenerator(
        name = "navi_history_generator",
        sequenceName = "navi_history_seq",
        initialValue = 1,
        allocationSize = 1
)
public class History {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "navi_history_generator")
    @Column(name = "history_no")
    private long no;        // 로그인 이력 id

    @Column(name = "history_ip", nullable = false)
    private String ip;      // 로그인 ip

    @Column(name = "history_login", nullable = false)
    @ColumnDefault(value = "Sysdate")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private String login;   // 로그인 시간

    @Column(name = "history_logout")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private String logout;  // 로그아웃 시간

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no")
    private User user;      // User 정보

    public History(String ip, String login, String logout, User user) {
        this.ip = ip;
        this.login = login;
        this.logout = logout;
        this.user = user;
    }
}
