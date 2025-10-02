package com.navi.accommodation.repository;

import com.navi.accommodation.domain.Acc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AccRepository extends JpaRepository<Acc, Long> {
    // 업데이트 할 때 기준이 되는 키
    Optional<Acc> findByContentId(Long ContentId);
}
