// src/main/java/com/navi/delivery/repository/BagRepository.java
package com.navi.delivery.repository;

import com.navi.delivery.domain.Bag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BagRepository extends JpaRepository<Bag, Long> {
    Optional<Bag> findByBagCode(String bagCode);
}
