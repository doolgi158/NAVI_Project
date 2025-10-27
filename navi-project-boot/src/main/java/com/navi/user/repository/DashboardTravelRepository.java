//package com.navi.user.repository;
//
//import com.navi.travel.domain.Travel;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
//@Repository
//public interface DashboardTravelRepository extends JpaRepository<Travel, Long> {
//    // 전체 등록된 여행지 수
//    long count();
//
//    // 전체 조회수 합계
//    @Query("SELECT COALESCE(SUM(t.views), 0) FROM Travel t")
//    long sumViews();
//
//    // 인기 여행지 TOP 5 (좋아요 + 북마크 + 조회수 합계)
//    @Query("""
//                SELECT t
//                FROM Travel t
//                ORDER BY (t.views + t.likesCount + t.bookmarkCount) DESC
//            """)
//    List<Travel> findTop5Popular();
//}
