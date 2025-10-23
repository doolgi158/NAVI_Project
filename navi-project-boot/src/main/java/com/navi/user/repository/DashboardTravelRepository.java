package com.navi.user.repository;

import com.navi.travel.domain.Travel;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DashboardTravelRepository extends JpaRepository<Travel, Long> {

    @Query("SELECT COUNT(t) FROM Travel t WHERE t.createdAt BETWEEN :start AND :end")
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("""
                SELECT COALESCE(SUM(t.views), 0)
                FROM Travel t
                WHERE t.createdAt BETWEEN :start AND :end
            """)
    Long sumViewsByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
            SELECT t FROM Travel t
            ORDER BY 
                (COALESCE(t.views, 0) + COALESCE(t.likesCount, 0) + COALESCE(t.bookmarkCount, 0)) DESC
            """)
    List<Travel> findTop5Popular(org.springframework.data.domain.Pageable pageable);

    default List<Travel> findTop5Popular() {
        return findTop5Popular(PageRequest.of(0, 5));
    }
}
