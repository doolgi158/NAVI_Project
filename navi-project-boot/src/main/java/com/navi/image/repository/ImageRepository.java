package com.navi.image.repository;

import com.navi.image.domain.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Long> {
    // 대상별 이미지 조회
    Optional<Image> findByTargetTypeAndTargetId(String targetType, String targetId);
    // 대상별 이미지 여러 개 (예: 객실, 숙소 등)
    List<Image> findAllByTargetTypeAndTargetId(String targetType, String targetId);
    // 특정 대상의 모든 이미지 삭제
    void deleteByTargetTypeAndTargetId(String targetType, String targetId);

    // 숙소 대표 이미지 가져오기
    @Query("SELECT i FROM Image i " +
            "WHERE i.targetType = :targetType AND i.targetId = :targetId " +
            "ORDER BY i.no ASC")
    List<Image> findTopByTargetTypeAndTargetId(@Param("targetType") String targetType,
                                               @Param("targetId") String targetId);
}
