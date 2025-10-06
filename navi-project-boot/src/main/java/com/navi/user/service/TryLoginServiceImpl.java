package com.navi.user.service;

import com.navi.user.domain.TryLogin;
import com.navi.user.domain.User;
import com.navi.user.dto.TryLoginDTO;
import com.navi.user.dto.UserDTO;
import com.navi.user.repository.TryLoginRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class TryLoginServiceImpl implements TryLoginService{
    private final TryLoginRepository tryLoginRepository;

    // 로그인 실패
    @Override
    public TryLoginDTO handleLoginFail(User user, String ip) {
        TryLogin entity = tryLoginRepository.findTryLoginUser(user)
                .orElse(TryLogin.builder()
                        .user(user)
                        .ip(ip)
                        .count(0)
                        .state('F')
                        .build());

        entity.increaseCount();
        tryLoginRepository.save(entity);

        return TryLoginDTO.fromEntity(entity); // Entity → DTO 변환
    }

    // 로그인 성공
    @Override
    public TryLoginDTO handleLoginSuccess(User user, String ip) {
        TryLogin entity = TryLogin.builder()
                .user(user)
                .ip(ip)
                .state('T')
                .count(0)
                .build();

        tryLoginRepository.save(entity);
        return TryLoginDTO.fromEntity(entity);
    }

    // 로그인 시도 조회
    @Override
    public TryLogin getRecentLoginAttempt(User user) {
        return tryLoginRepository.findTryLoginUser(user).orElse(null);
    }
}
