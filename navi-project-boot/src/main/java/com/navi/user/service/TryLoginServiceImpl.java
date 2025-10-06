package com.navi.user.service;

import com.navi.user.domain.TryLogin;
import com.navi.user.dto.TryLoginDTO;
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
}
