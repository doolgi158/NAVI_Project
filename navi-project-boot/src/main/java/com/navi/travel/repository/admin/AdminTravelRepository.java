package com.navi.travel.repository.admin;

import com.navi.travel.domain.Travel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminTravelRepository extends JpaRepository<Travel, Long> {
    // 관리자 전용 커스텀 쿼리 (필요 시 추가)
}