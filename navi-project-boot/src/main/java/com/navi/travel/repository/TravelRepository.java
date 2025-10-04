package com.navi.travel.repository;

import com.navi.travel.domain.Travel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TravelRepository extends JpaRepository<Travel, Long> {
    Optional<Travel> findByContentId(String contentId); //CONTENT_ID로 조회
}