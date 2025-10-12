package com.navi.travel.repository;

import com.navi.travel.domain.Travel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

@Repository
public interface TravelRepository extends JpaRepository<Travel, Long>, JpaSpecificationExecutor<Travel> {
    Optional<Travel> findByContentId(String contentId);
    Page<Travel> findByTitleContaining(String title, Pageable pageable);
    Page<Travel> findAll(Pageable pageable);        // 기존의 목록 조회 메서드 (전체 목록)

    @Modifying
    @Query("UPDATE Travel t SET t.views = t.views + 1 WHERE t.travelId = :travelId")
    int incrementViews(@Param("travelId") Long travelId);

    @Query(value = """
        SELECT t.*, COUNT(l.like_id) AS likes_count
        FROM navi_travel t
        LEFT JOIN navi_like l ON t.travel_id = l.travel_id
        GROUP BY t.travel_id, t.contents_id, t.contents_cd, 
                t.category_name, t.title, t.introduction, t.address, 
                t.road_address, t.phone_no, t.tag, t.longitude, t.latitude, 
                t.region1_name, t.region2_name, t.photo_id, t.image_path, 
                t.thumbnail_path, t.views_count, t.state, t.homepage, 
                t.parking, t.fee, t.hours
        ORDER BY likes_count DESC
        """,
            countQuery = "SELECT COUNT(*) FROM navi_travel",
            nativeQuery = true)
    Page<Travel> findAllOrderByLikesCount(Pageable pageable);


}