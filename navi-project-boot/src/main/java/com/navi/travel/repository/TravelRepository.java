package com.navi.travel.repository;

import com.navi.travel.domain.Travel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

@Repository
public interface TravelRepository extends JpaRepository<Travel, Long>, JpaSpecificationExecutor<Travel> {

    Optional<Travel> findByContentId(String contentId);
    //    Page<Travel> findByTitleContaining(String title, Pageable pageable);
    Page<Travel> findAll(Pageable pageable);

    /** 검색 */

    // 예시: TravelRepository.java
    @Query("""
SELECT t FROM Travel t
WHERE REPLACE(LOWER(t.title), ' ', '') LIKE LOWER(CONCAT('%', REPLACE(:keyword, ' ', ''), '%'))
""")
    Page<Travel> searchByTitleIgnoringSpaces(@Param("keyword") String keyword, Pageable pageable);


    /**
     * ✅ 조회수 증가 (단순 +1)
     */
    @Modifying
    @Query("UPDATE Travel t SET t.views = COALESCE(t.views, 0) + 1 WHERE t.travelId = :travelId")
    int incrementViews(@Param("travelId") Long travelId);

    /**
     * ✅ 좋아요 수 증가 / 감소
     */
    @Modifying
    @Query("UPDATE Travel t SET t.likesCount = COALESCE(t.likesCount, 0) + 1 WHERE t.travelId = :travelId")
    int incrementLikes(@Param("travelId") Long travelId);

    @Modifying
    @Query("UPDATE Travel t SET t.likesCount = CASE WHEN t.likesCount > 0 THEN t.likesCount - 1 ELSE 0 END WHERE t.travelId = :travelId")
    int decrementLikes(@Param("travelId") Long travelId);

    /**
     * ✅ 북마크 수 증가 / 감소
     */
    @Modifying
    @Query("UPDATE Travel t SET t.bookmarkCount = COALESCE(t.bookmarkCount, 0) + 1 WHERE t.travelId = :travelId")
    int incrementBookmarks(@Param("travelId") Long travelId);

    @Modifying
    @Query("UPDATE Travel t SET t.bookmarkCount = CASE WHEN t.bookmarkCount > 0 THEN t.bookmarkCount - 1 ELSE 0 END WHERE t.travelId = :travelId")
    int decrementBookmarks(@Param("travelId") Long travelId);

    /**
     * ✅ 캐시 컬럼 기반 인기순 정렬 (좋아요 → 조회수 → ID 순)
     * ⚡️ 매우 빠른 성능: JOIN, COUNT DISTINCT 없음
     */
    @Query(
            value = """
            SELECT 
                t.travel_id AS travel_id,
                t.title AS title,
                t.region1_name AS region1_name,
                t.region2_name AS region2_name,
                t.image_path AS image_path,
                t.thumbnail_path AS thumbnail_path,
                NVL(t.views_count, 0) AS views_count,
                NVL(t.likes_count, 0) AS likes_count,
                NVL(t.bookmarks_count, 0) AS bookmarks_count
            FROM navi_travel t
            ORDER BY 
                NVL(t.likes_count, 0) DESC,
                NVL(t.views_count, 0) DESC,
                t.travel_id DESC
            """,
            countQuery = "SELECT COUNT(*) FROM navi_travel",
            nativeQuery = true
    )
    Page<Object[]> findAllOrderByPopularityNative(Pageable pageable);
    /**
     * ✅ 관리자 전용 contentId 최대값 조회
     */
    @Query("SELECT MAX(t.contentId) FROM Travel t WHERE t.contentId LIKE 'CONT_%'")
    String findMaxAdminContentId();
}
