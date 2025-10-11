package com.navi.accommodation.repository;

import com.navi.accommodation.domain.Acc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccRepository extends JpaRepository<Acc, Long> {
    Optional<Acc> findByContentId(Long contentId);
    boolean existsByTitleAndAddress(String title, String address);
}
