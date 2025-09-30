package com.navi.accommodation.repository;

import com.navi.accommodation.domain.Acc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccRepository extends JpaRepository<Acc, String> {
//    List<Acc> findByTitle();
}
