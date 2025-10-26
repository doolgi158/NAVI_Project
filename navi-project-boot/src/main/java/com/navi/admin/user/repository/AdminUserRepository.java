package com.navi.admin.user.repository;

import com.navi.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AdminUserRepository extends JpaRepository<User, Long> {
    // 전체 유저 수
    @Query("SELECT COUNT(u) FROM User u")
    long countAllUsers();

    // 최근 30일 이내 가입자 수
    @Query("SELECT COUNT(u) FROM User u WHERE u.signUp >= :cutoff")
    long countRecentJoin(@Param("cutoff") LocalDateTime cutoff);

    // 최근 30일 이내 탈퇴자 수
    @Query("SELECT COUNT(u) FROM User u WHERE u.userState = 'DELETE' AND u.signUp >= :cutoff")
    long countRecentLeave(@Param("cutoff") LocalDateTime cutoff);

    // 활성 유저 수 (NORMAL 상태)
    @Query("SELECT COUNT(u) FROM User u WHERE u.userState = 'NORMAL'")
    long countActiveUsers();
}
