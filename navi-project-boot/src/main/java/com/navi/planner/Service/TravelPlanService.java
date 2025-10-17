package com.navi.planner.Service;

import com.navi.planner.domain.TravelPlan;
import com.navi.planner.dto.TravelPlanRequestDTO;
import java.util.List;

public interface TravelPlanService {
    TravelPlan savePlan(long userNo, TravelPlanRequestDTO dto);
    List<TravelPlan> getMyPlans(long userNo);
}
