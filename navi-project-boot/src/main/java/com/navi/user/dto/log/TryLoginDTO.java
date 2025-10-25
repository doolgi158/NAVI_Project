package com.navi.user.dto.log;

import com.navi.user.domain.TryLogin;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder(builderMethodName = "dtoBuilder")
@AllArgsConstructor
@NoArgsConstructor
public class TryLoginDTO extends TryLogin {
    private Long tryid;                 // 시도 아이디
    private int count;                  // 시도 횟수
    private char state;                 // 성공 여부
    private LocalDateTime time;         // 로그인시도 시간
    private LocalDateTime lockuntil;    // 해제 시간
    private String ip;                  // 요청한 PC의 IP
    private String username;                // 이름
}