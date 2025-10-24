package com.navi.planner.repository;

import com.navi.planner.domain.TravelPlanItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TravelPlanItemRepository extends JpaRepository<TravelPlanItem, Long> {

    /** ✅ planId 기준으로 모든 item 제거 */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        delete from TravelPlanItem i 
        where i.day.dayId in (
            select d.dayId from TravelPlanDay d 
            where d.travelPlan.planId = :planId
        )
    """)
    void deleteItemsByPlanId(Long planId);

    /** ✅ 단일 itemId 기준 삭제 (여행지 개별 제외 지원용) */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        delete from TravelPlanItem i 
        where i.itemId = :itemId
    """)
    void deleteItemById(Long itemId);
}
