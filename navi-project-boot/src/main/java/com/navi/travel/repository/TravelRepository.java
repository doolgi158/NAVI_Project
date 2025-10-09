package com.navi.travel.repository;

import com.navi.travel.domain.Travel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

@Repository
public interface TravelRepository extends JpaRepository<Travel, Long>, JpaSpecificationExecutor<Travel> {
    Optional<Travel> findByContentId(String contentId);
    Page<Travel> findByTitleContaining(String title, Pageable pageable);
    Page<Travel> findAll(Pageable pageable);        // 기존의 목록 조회 메서드 (전체 목록)
}
