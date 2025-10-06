package com.navi.user.dto;

import com.navi.user.domain.TryLogin;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class TryLoginDTO extends TryLogin {
    private Long tryid;                 // 시도 아이디
    private int count;                  // 시도 횟수
    private char state;                 // 성공 여부
    private LocalDateTime time;         // 로그인시도 시간
    private String ip;                  // 요청한 PC의 IP
    private LocalDateTime lockuntil;    // 해제 시간

    public static TryLoginDTO fromEntity(TryLogin entity) {
        TryLoginDTO dto = new TryLoginDTO();
        dto.setTryid(entity.getTryid());
        dto.setCount(entity.getCount());
        dto.setState(entity.getState());
        dto.setTime(entity.getTime());
        dto.setIp(entity.getIp());
        dto.setLockuntil(entity.getLockuntil());
        return dto;
    }
}