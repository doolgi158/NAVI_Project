package com.navi.planner.service;

import com.navi.planner.domain.TravelPlan;
import com.navi.planner.dto.TravelPlanListResponseDTO;
import com.navi.planner.dto.TravelPlanRequestDTO;
import java.util.List;

public interface TravelPlanService {

    /** 여행계획 저장 (userId 기준) */
    Long savePlan(String userId, TravelPlanRequestDTO dto); // ✅ Long 반환

    /** 사용자별 여행계획 목록 조회 */
    List<TravelPlanListResponseDTO> getMyPlans(String userId);

    /** 여행계획 수정 */
    void updatePlan(Long planId, String userId, TravelPlanRequestDTO dto);

    /** 여행계획 삭제 */
    void deletePlan(Long planId);


}