//package com.navi.travel.repository;
//
//import com.navi.travel.domain.Bookmark;
//import com.navi.travel.domain.Travel;
//import com.navi.user.domain.User;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Modifying;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
//
//    @Query("SELECT b FROM Bookmark b WHERE b.travel.travelId = :travelId AND b.user.id = :id")
//    Optional<Bookmark> findByTravelIdAndId(@Param("travelId") Long travelId, @Param("id") String id);
//
//    @Modifying
//    @Query("DELETE FROM Bookmark b WHERE b.travel.travelId = :travelId AND b.user.id = :id")
//    void deleteByTravelIdAndId(@Param("travelId") Long travelId, @Param("id") String id);
//
//    @Query("SELECT COUNT(b) FROM Bookmark b WHERE b.travel.travelId = :travelId")
//    long countByTravelId(@Param("travelId") Long travelId);
//
//    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN TRUE ELSE FALSE END FROM Bookmark b WHERE b.travel.travelId = :travelId AND b.user.id = :id")
//    boolean existsByTravelIdAndId(@Param("travelId") Long travelId, @Param("id") String id);
//
//    Page<Bookmark> findAllByUser(User user, Pageable pageable);
//
//    // 북마크한 유저의 데이터 검색
//    List<Bookmark> findByUser_No(Long userNo);
//
//    @Modifying
//    @Query("DELETE FROM Like l WHERE l.user.no = :userNo AND l.travel.travelId = :travelId")
//    void deleteByUser_NoAndTravel_TravelId(@Param("userNo") Long userNo, @Param("travelId") Long travelId);
//
//    /**
//     * ✅ 북마크 생성 헬퍼 (TravelActionServiceImpl에서 사용)
//     */
//    default Bookmark saveBookmark(Travel travel, User user) {
//        Bookmark bookmark = new Bookmark(travel, user);
//        bookmark.setUserId(user.getId());
//        return save(bookmark);
//    }
//}
