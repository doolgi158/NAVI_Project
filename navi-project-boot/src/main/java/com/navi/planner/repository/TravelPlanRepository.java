package com.navi.planner.repository;

import com.navi.planner.domain.TravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TravelPlanRepository extends JpaRepository<TravelPlan, Long> {
    List<TravelPlan> findByUserNo(Long no);
}
