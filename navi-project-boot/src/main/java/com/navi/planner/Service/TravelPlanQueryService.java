package com.navi.planner.Service;

import com.navi.planner.domain.TravelPlan;
import com.navi.planner.dto.TravelPlanDetailResponseDTO;
import com.navi.planner.dto.TravelPlanListResponseDTO;
import com.navi.planner.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TravelPlanQueryService {

    private final TravelPlanRepository travelPlanRepository;

    /** ✅ 사용자별 여행계획 목록 조회 */
    public List<TravelPlanListResponseDTO> getMyPlans(Long userNo) {
        return travelPlanRepository.findByUserNo(userNo).stream()
                .map(TravelPlanListResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /** ✅ 단일 여행계획 상세 조회 */
    public TravelPlanDetailResponseDTO getPlanDetail(Long planId, Long userNo) {
        TravelPlan plan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("해당 여행계획이 존재하지 않습니다."));

        // 🔹 long과 Long 비교 시 == 또는 != 사용
        if (plan.getUser().getNo() != userNo) {
            throw new SecurityException("해당 여행계획에 접근할 권한이 없습니다.");
        }

        return TravelPlanDetailResponseDTO.fromEntity(plan);
    }
}
