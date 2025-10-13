package com.navi.delivery.repository;

import com.navi.delivery.domain.Bag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BagRepository extends JpaRepository<Bag, String> {
}
