package com.navi.accommodation.repository;

import com.navi.accommodation.domain.Acc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccRepository extends JpaRepository<Acc, Long> {
    Optional<Acc> findByContentId(Long contentId);
    Optional<Acc> findByAccId(String accId);

    /* 전체 숙소 조회 (운영중 + 객실 존재) */
    @Query("SELECT a FROM Acc a JOIN a.rooms r WHERE a.active = true")
    List<Acc> findAllActiveWithRooms();

    /* 숙소명으로 찾기 */
    @Query("SELECT a FROM Acc a WHERE LOWER(a.title) LIKE %:keyword%")
    List<Acc> findByTitle(@Param("keyword") String keyword);

    /* 지역별 찾기 */
    @Query("SELECT a FROM Acc a WHERE a.township.townshipName = :townshipName")
    List<Acc> findByTownshipName(@Param("townshipName") String townshipName);

    /* contentId = null인 숙소 찾기 (관리자용) */
    @Query("SELECT a FROM Acc a WHERE a.contentId IS NULL")
    List<Acc> findAllWithoutContentId();

    List<Acc> findByTitleContainingIgnoreCase(String title);

    /* accId 시퀀스 기반 생성용 */
    @Query(value = "SELECT ACC_SEQ.NEXTVAL FROM DUAL", nativeQuery = true)
    Long getNextSeqVal();
}