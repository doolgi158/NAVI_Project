package com.navi.location.repository;

import com.navi.location.domain.Township;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TownshipRepository extends JpaRepository<Township, Long> {
}
