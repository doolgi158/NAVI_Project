package com.navi.bag.repository;

import com.navi.bag.domain.Bag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BagRepository extends JpaRepository<Bag, String> {
}
