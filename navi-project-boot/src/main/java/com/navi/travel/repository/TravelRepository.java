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

    @Modifying
    @Query("UPDATE Travel t SET t.views = t.views + 1 WHERE t.travelId = :travelId")
    int incrementViews(@Param("travelId") Long travelId);

    /**
     * ✅ 인기순 정렬용 Native Query (좋아요 많은 순)
     */
    @Query(
            value = """
            SELECT 
                t.travel_id AS travel_id,
                t.title AS title,
                t.region1_name AS region1_name,
                t.region2_name AS region2_name,
                t.thumbnail_path AS thumbnail_path,
                COUNT(l.like_id) AS likes_count
            FROM navi_travel t
            LEFT JOIN navi_like l ON t.travel_id = l.travel_id
            GROUP BY t.travel_id, t.title, t.region1_name, t.region2_name, t.thumbnail_path
            ORDER BY likes_count DESC
        """,
            countQuery = """
            SELECT COUNT(*) 
            FROM (
                SELECT t.travel_id
                FROM navi_travel t
                LEFT JOIN navi_like l ON t.travel_id = l.travel_id
                GROUP BY t.travel_id
            ) sub
        """,
            nativeQuery = true
    )
    Page<Object[]> findAllOrderByLikesCountNative(Pageable pageable);

}
