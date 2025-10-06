package com.navi.user.service;

import com.navi.user.domain.TryLogin;
import com.navi.user.domain.User;
import com.navi.user.dto.TryLoginDTO;
import com.navi.user.dto.UserDTO;
import com.navi.user.repository.TryLoginRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.LockedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class TryLoginServiceImpl implements TryLoginService{
    private final TryLoginRepository tryLoginRepository;

    // 로그인 실패
    @Override
    public TryLoginDTO handleLoginFail(String ip) {
        TryLogin entity = tryLoginRepository.findByIp(ip)
                .orElse(TryLogin.builder()
                        .ip(ip)
                        .count(0)
                        .state('F')
                        .time(LocalDateTime.now())
                        .build());
        if (entity.getLockuntil() != null && LocalDateTime.now().isBefore(entity.getLockuntil())) {
            throw new LockedException("10분간 로그인 시도가 차단되었습니다.");
        }
        entity.increaseCount();

        if (entity.getCount() >= 5) {
            entity.setLockuntil(LocalDateTime.now().plusMinutes(10));
            entity.setCount(0); // 카운트 초기화
        }
        tryLoginRepository.save(entity);

        return TryLoginDTO.fromEntity(entity); // Entity → DTO 변환
    }

    // 로그인 성공
    @Override
    public TryLoginDTO handleLoginSuccess(String ip) {
        TryLogin entity = TryLogin.builder()
                .ip(ip)
                .state('T')
                .count(0)
                .time(LocalDateTime.now())
                .build();

        entity.trySuccess();
        tryLoginRepository.save(entity);
        return TryLoginDTO.fromEntity(entity);
    }
}
