package com.navi.user.util;

import com.navi.user.domain.Withdraw;
import com.navi.user.repository.UserRepository;
import com.navi.user.repository.WithdrawRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class WithdrawCleanupScheduler {
    private final WithdrawRepository withdrawRepository;
    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 0 * * *") // 매일 새벽 3시
    @Transactional
    public void cleanUpWithdrawUsers() {
        List<Withdraw> expired = withdrawRepository.findAll().stream()
                .filter(w -> w.getDue().isBefore(LocalDateTime.now()) && w.getEnd() == null)
                .toList();

        expired.forEach(withdraw -> {
            withdraw.markProcessed();
            userRepository.delete(withdraw.getUser());
        });
    }
}
