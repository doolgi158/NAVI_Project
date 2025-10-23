package com.navi.planner.repository;

import com.navi.planner.domain.TravelPlanItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface TravelPlanItemRepository extends JpaRepository<TravelPlanItem, Long> {

    /** planId 기준으로 모든 item 제거 */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        delete from TravelPlanItem i 
        where i.day.dayId in (
            select d.dayId from TravelPlanDay d 
            where d.travelPlan.planId = :planId
        )
    """)
    void deleteItemsByPlanId(Long planId);
}
