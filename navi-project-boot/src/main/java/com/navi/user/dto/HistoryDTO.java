package com.navi.user.dto;

import com.navi.user.domain.History;
import com.navi.user.domain.User;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HistoryDTO {
    private long no;        // 로그인 이력 id
    private String ip;      // 로그인 ip
    private String login;   // 로그인 시간
    private String logout;  // 로그아웃 시간
    private User user;      // User 정보

    public History toEntity() {
        return History.builder()
                .no(this.no)
                .ip(this.ip)
                .login(this.login)
                .logout(this.logout)
                .user(this.user)
                .build();
    }

    public static HistoryDTO fromEntity(History history) {
        if (history == null) return null;

        return HistoryDTO.builder()
                .no(history.getNo())
                .ip(history.getIp())
                .login(history.getLogin())
                .logout(history.getLogout())
                .user(history.getUser())
                .build();
    }
}