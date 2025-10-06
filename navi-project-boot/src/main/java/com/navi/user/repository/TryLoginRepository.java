package com.navi.user.repository;

import com.navi.user.domain.TryLogin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

public interface TryLoginRepository extends JpaRepository<TryLogin, Long> {
    // 특정 IP로 마지막 시도 찾기
    Optional<TryLogin> findByIp(String ip);

    // 특정 IP 존재 여부 확인
    boolean existsByIp(String ip);
}
