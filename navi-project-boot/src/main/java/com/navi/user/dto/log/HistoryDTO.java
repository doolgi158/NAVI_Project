package com.navi.user.dto.log;

import com.navi.user.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HistoryDTO {
    private long no;                // 로그인 이력 id
    private String ip;              // 로그인 ip
    private LocalDateTime login;    // 로그인 시간
    private LocalDateTime logout;   // 로그아웃 시간
    private User user;              // User 정보
}
