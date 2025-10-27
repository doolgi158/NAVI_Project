package com.navi.admin.accommodation.repository;

import com.navi.accommodation.domain.Acc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AdminAccommodationDashboardRepository extends JpaRepository<Acc, Long> {
    // 생성일 기준 숙소 등록 수
    @Query("""
                SELECT COUNT(a)
                FROM Acc a
                WHERE a.createdTime BETWEEN :start AND :end
            """)
    long countCreatedBetween(LocalDateTime start, LocalDateTime end);

    // 조회수 합계
    @Query("""
                SELECT COALESCE(SUM(a.viewCount), 0)
                FROM Acc a
                WHERE a.createdTime BETWEEN :start AND :end
            """)
    long sumViewsBetween(LocalDateTime start, LocalDateTime end);
}
