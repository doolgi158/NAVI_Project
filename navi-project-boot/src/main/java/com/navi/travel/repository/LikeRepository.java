package com.navi.travel.repository;

import com.navi.travel.domain.Like;
import com.navi.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    @Query("SELECT l FROM Like l WHERE l.travel.travelId = :travelId AND l.user.id = :id")
    Optional<Like> findByTravelIdAndId(@Param("travelId") Long travelId, @Param("id") String id);

    @Modifying
    @Query("DELETE FROM Like l WHERE l.travel.travelId = :travelId AND l.user.id = :id")
    void deleteByTravelIdAndId(@Param("travelId") Long travelId, @Param("id") String id);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.travel.travelId = :travelId")
    long countByTravelId(@Param("travelId") Long travelId);

    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN TRUE ELSE FALSE END FROM Like l WHERE l.travel.travelId = :travelId AND l.user.id = :id")
    boolean existsByTravelIdAndId(@Param("travelId") Long travelId, @Param("id") String id);

    Page<Like> findAllByUser(User user, Pageable pageable);
}