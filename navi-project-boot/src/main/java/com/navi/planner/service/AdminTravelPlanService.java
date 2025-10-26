package com.navi.planner.service;

import com.navi.planner.dto.admin.AdminTravelPlanDetailResponseDTO;
import com.navi.planner.dto.admin.AdminTravelPlanListResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminTravelPlanService {
    Page<AdminTravelPlanListResponseDTO> getAllPlans(int page, int size, String search);
    AdminTravelPlanDetailResponseDTO getPlanDetail(Long planId);
    void deletePlan(Long planId);
}
