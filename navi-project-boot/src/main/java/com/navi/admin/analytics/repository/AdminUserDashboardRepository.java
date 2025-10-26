package com.navi.admin.analytics.repository;

import com.navi.user.domain.User;
import com.navi.user.enums.UserState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminUserDashboardRepository extends JpaRepository<User, Long> {
    @Query(value = """
                SELECT 
                    TO_CHAR(u.user_signup, 'YYYY-MM') AS period,
                    COUNT(u.user_no) AS total,
                    SUM(CASE WHEN u.user_state = 'DELETE' THEN 1 ELSE 0 END) AS deleted,
                    SUM(CASE WHEN u.user_state = 'NORMAL' THEN 1 ELSE 0 END) AS active
                FROM navi_users u
                WHERE u.user_signup >= ADD_MONTHS(TRUNC(SYSDATE), -6)
                GROUP BY TO_CHAR(u.user_signup, 'YYYY-MM')
                ORDER BY TO_CHAR(u.user_signup, 'YYYY-MM')
            """, nativeQuery = true)
    List<Object[]> findUserTrendMonthly();

    // 상태별 유저 수 카운트
    long countByUserState(UserState state);

    // 전체 카운트
    long count();

    // 특정 기간 내 가입자 수
    @Query("SELECT COUNT(u) FROM User u WHERE u.signUp BETWEEN :start AND :end")
    long countJoinBetween(@Param("start") LocalDateTime start,
                          @Param("end") LocalDateTime end);

    // 특정 기간 내 탈퇴자 수
    @Query("SELECT COUNT(u) FROM User u WHERE u.userState = :state AND u.signUp BETWEEN :start AND :end")
    long countLeaveBetween(@Param("state") UserState state,
                           @Param("start") LocalDateTime start,
                           @Param("end") LocalDateTime end);

    // 현재 활성 사용자 수
    @Query("SELECT COUNT(u) FROM User u WHERE u.userState = :state")
    long countActiveUsers(@Param("state") UserState state);
}
