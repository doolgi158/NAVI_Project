package com.navi.planner.service;

import com.navi.planner.domain.TravelPlan;
import com.navi.planner.dto.TravelPlanDetailResponseDTO;
import com.navi.planner.dto.TravelPlanListResponseDTO;
import com.navi.planner.repository.TravelPlanRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TravelPlanQueryServiceImpl implements TravelPlanQueryService {

    private final TravelPlanRepository travelPlanRepository;

    /** ✅ 사용자별 여행계획 목록 조회 */
    @Override
    public List<TravelPlanListResponseDTO> getMyPlans(String userId) {
        log.info("📦 getMyPlans() userId={}", userId);
        List<TravelPlan> plans = travelPlanRepository.findAllWithDaysAndItemsByUserId(userId);

        return plans.stream()
                .sorted(Comparator.comparing(TravelPlan::getStartDate))
                .map(TravelPlanListResponseDTO::fromEntity)
                .toList();
    }

    /** ✅ 단일 여행계획 상세 조회 */
    @Override
    public TravelPlanDetailResponseDTO getPlanDetail(Long planId, String userId) {
        log.info("📦 getPlanDetail() planId={}, userId={}", planId, userId);
        TravelPlan plan = travelPlanRepository.findByIdWithDaysAndItems(planId)
                .orElseThrow(() -> new EntityNotFoundException("해당 여행계획이 존재하지 않습니다."));

        // ✅ 사용자 검증 (본인 계획만 조회 가능)
        if (plan.getUser() == null || !plan.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 여행계획만 조회할 수 있습니다.");
        }

        return TravelPlanDetailResponseDTO.fromEntity(plan);
    }

}
