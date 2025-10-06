package com.navi.user.repository;

import com.navi.user.domain.TryLogin;
import com.navi.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TryLoginRepository extends JpaRepository<TryLogin, Long> {
    // 유저별 최근 로그인 시도 조회
    @Query("SELECT t FROM TryLogin t WHERE t.user = :user")
    Optional<TryLogin> findTryLoginUser(@Param("user") User user);
}
