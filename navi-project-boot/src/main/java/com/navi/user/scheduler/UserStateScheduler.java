package com.navi.user.scheduler;

import com.navi.user.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserStateScheduler {
    private final UserService userService;

    // 매일 새벽 3시 실행
    @Scheduled(cron = "0 0 3 * * *")
    public void checkUserStates() {
        log.info("⏰ 유저 상태 자동 갱신 스케줄러 시작");

        userService.autoSleepInactiveUsers();   // NORMAL → SLEEP
        userService.autoDeleteSleepUsers();     // SLEEP → DELETE

        log.info("✅ 유저 상태 자동 갱신 완료");
    }
}
