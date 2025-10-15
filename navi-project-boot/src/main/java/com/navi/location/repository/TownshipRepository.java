package com.navi.location.repository;

import com.navi.location.domain.Township;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TownshipRepository extends JpaRepository<Township, Long> {
    Optional<Township> findByTownshipName(String townshipName);
}
