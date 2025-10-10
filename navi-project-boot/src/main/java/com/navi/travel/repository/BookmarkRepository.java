package com.navi.travel.repository;

import com.navi.travel.domain.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
// ✅ JpaRepository는 엔티티 타입과 기본 키(Bookmark 엔티티의 ID) 타입만 받습니다.
//    Bookmark 엔티티의 기본 키 타입은 Long이므로 <Bookmark, Long>으로 수정합니다.
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    // ✅ ID를 사용하여 북마크 기록을 찾습니다. (userId는 String 타입)
    Optional<Bookmark> findByTravelIdAndId(Long travelId, String id);

    // ✅ ID를 사용하여 북마크 기록을 삭제합니다. (userId는 String 타입)
    @Modifying
    @Query("DELETE FROM Bookmark b WHERE b.travelId = :travelId AND b.id = :id")
    void deleteByTravelIdAndId(@Param("travelId") Long travelId, @Param("id") String id);

    // ✅ ID를 사용하여 북마크 개수를 카운트합니다.
    long countByTravelId(Long travelId);

    // ✅ 상세 페이지에서 북마크 여부 체크 시 사용 (userId는 String 타입)
    boolean existsByTravelIdAndId(Long travelId, String id);
}