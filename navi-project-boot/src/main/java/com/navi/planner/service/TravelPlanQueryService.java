package com.navi.planner.service;

import com.navi.planner.dto.TravelPlanDetailResponseDTO;
import com.navi.planner.dto.TravelPlanListResponseDTO;

import java.util.List;

public interface TravelPlanQueryService {

    /** 사용자별 여행계획 목록 조회 (userNo 기준) */
    List<TravelPlanListResponseDTO> getMyPlans(String userId);

    /** 여행계획 상세 조회 */
    TravelPlanDetailResponseDTO getPlanDetail(Long planId, String userId);
}
