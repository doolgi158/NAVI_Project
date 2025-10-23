package com.navi.user.repository;

import com.navi.travel.domain.Travel;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DashboardTravelRepository extends JpaRepository<Travel, Long> {
    // 전체 등록된 여행지 수
    long count();

    // 전체 조회수 합계
    @Query("SELECT COALESCE(SUM(t.views), 0) FROM Travel t")
    long sumViews();

    // 조회수 + 좋아요 + 북마크 합산 점수로 인기 여행지 상위 5개 추출
    @Query("""
                SELECT t FROM Travel t
                ORDER BY 
                    (COALESCE(t.views, 0) + COALESCE(t.likesCount, 0) + COALESCE(t.bookmarkCount, 0)) DESC
            """)
    List<Travel> findTop5Popular(Pageable pageable);

    default List<Travel> findTop5Popular() {
        return findTop5Popular(PageRequest.of(0, 5));
    }
}
