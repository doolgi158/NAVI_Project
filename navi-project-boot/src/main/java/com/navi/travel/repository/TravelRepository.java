package com.navi.travel.repository;

import com.navi.travel.domain.Travel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

@Repository
public interface TravelRepository extends JpaRepository<Travel, Long>, JpaSpecificationExecutor<Travel> {
    Optional<Travel> findByContentId(String contentId);
}