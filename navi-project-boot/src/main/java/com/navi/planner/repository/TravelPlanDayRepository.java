package com.navi.planner.repository;

import com.navi.planner.domain.TravelPlanDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelPlanDayRepository extends JpaRepository<TravelPlanDay, Long> {

    /** ✅ 특정 여행계획(planId) 기준 조회 */
    List<TravelPlanDay> findByTravelPlan_PlanId(Long planId);

    /** ✅ 특정 사용자(userId) 기준 전체 일정 조회 */
    List<TravelPlanDay> findByTravelPlan_User_Id(String userId);

    /** ✅ 사용자 + 날짜 조합으로 필터링 (예: 특정 날짜의 일정 조회) */
    List<TravelPlanDay> findByTravelPlan_User_IdAndDayDate(String userId, java.time.LocalDate dayDate);

    /** planId 기준으로 모든 day 제거 */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        delete from TravelPlanDay d 
        where d.travelPlan.planId = :planId
    """)
    void deleteDaysByPlanId(Long planId);
}