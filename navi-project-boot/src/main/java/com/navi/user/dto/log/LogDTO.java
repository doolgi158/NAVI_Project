package com.navi.user.dto.log;

import com.navi.user.domain.User;
import com.navi.user.enums.ActionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LogDTO {
    private long ID;                    // 로그 아이디
    private User user;                  // 유저 정보
    private ActionType actionType;      // 행동 타입
    private Long targetId;              // 대상 ID
    private String targetName;          // 대상명 (옵션 — 분석용으로 남겨도 좋음)
    private LocalDateTime createdAt;    // 발생 시각
}
