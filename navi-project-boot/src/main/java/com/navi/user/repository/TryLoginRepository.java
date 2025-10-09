package com.navi.user.repository;

import com.navi.user.domain.TryLogin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TryLoginRepository extends JpaRepository<TryLogin, Long> {
    // 특정 IP로 마지막 시도 찾기
    Optional<TryLogin> findByIp(String ip);

    // 로그인 시도 기록 업데이트
    @Transactional
    default void recordLoginAttempt(String ip, boolean success) {
        TryLogin record = findByIp(ip).orElseGet(() -> TryLogin.builder()
                .ip(ip)
                .count(0)
                .state('F')
                .time(LocalDateTime.now())
                .build());

        if (success) {
            record.trySuccess(); // 성공 시 초기화
            record.setLockuntil(null);
        } else {
            record.increaseCount();
            if (record.getCount() >= 5) {
                record.setLockuntil(LocalDateTime.now().plusMinutes(10)); // 10분 차단
            }
        }

        record.setTime(LocalDateTime.now());
        save(record);
    }

    // 현재 차단된 IP인지 확인
    @Transactional
    default boolean isIpLocked(String ip) {
        Optional<TryLogin> record = findByIp(ip);
        if(record.isEmpty()) return false;

        TryLogin tryLogin = record.get();

        // 해제 시간이 지나면 자동 초기화
        if (tryLogin.getLockuntil() != null && LocalDateTime.now().isAfter(tryLogin.getLockuntil())) {
            tryLogin.setCount(0);
            tryLogin.setState('T');
            tryLogin.setLockuntil(null);
            save(tryLogin);
            return false;
        }

        return tryLogin.getCount() >= 5 && tryLogin.getState() == 'F';
    }
}
