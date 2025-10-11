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

    /* 숙소명으로 찾기 */
    @Query("SELECT a FROM Acc a WHERE LOWER(a.title) LIKE %:keyword%")
    List<Acc> findByTitle(@Param("keyword") String keyword);

    /* 지역별 찾기 */
    @Query("SELECT a FROM Acc a WHERE a.township.townshipName = :townshipName")
    List<Acc>findByTownshipName(@Param("townshipName") String townshipName);
}
