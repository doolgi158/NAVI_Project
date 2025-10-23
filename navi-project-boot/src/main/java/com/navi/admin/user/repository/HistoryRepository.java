package com.navi.admin.user.repository;

import com.navi.user.domain.History;
import com.navi.user.domain.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HistoryRepository extends JpaRepository<History, Long> {
    // 특정 유저의 가장 최근 로그인 이력 1건 조회
    @Query("SELECT h FROM History h WHERE h.user = :user ORDER BY h.no DESC")
    List<History> findLatestHistory(User user, Pageable pageable);

    @Query("""
                SELECT h FROM History h
                WHERE h.user.no IN :userNos
                AND h.login = (
                    SELECT MAX(h2.login)
                    FROM History h2
                    WHERE h2.user = h.user
                )
            """)
    List<History> findRecentHistoriesByUserNos(@Param("userNos") List<Long> userNos);

    Optional<History> findTopByUserOrderByLoginDesc(User user);
}
