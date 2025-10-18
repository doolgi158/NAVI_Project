package com.navi.planner.service;

import com.navi.planner.domain.TravelPlan;
import com.navi.planner.dto.TravelPlanDetailResponseDTO;
import com.navi.planner.dto.TravelPlanListResponseDTO;
import com.navi.planner.repository.TravelPlanRepository;
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import lombok.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TravelPlanQueryService {

    private final TravelPlanRepository travelPlanRepository;
    private final UserRepository userRepository;

    /** ✅ 사용자별 여행계획 목록 조회 */
    public List<TravelPlanListResponseDTO> getMyPlans(String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다. userId=" + userId));

        return travelPlanRepository.findByUser_Id(userId)
                .stream()
                .map(TravelPlanListResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /** ✅ 여행계획 상세 조회 */
    public TravelPlanDetailResponseDTO getPlanDetail(Long planId, String userId) {
        TravelPlan plan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("해당 여행계획이 존재하지 않습니다. planId=" + planId));

        if (!plan.getUser().getId().equals(userId)) {
            throw new SecurityException("해당 여행계획에 접근할 권한이 없습니다.");
        }

        return TravelPlanDetailResponseDTO.fromEntity(plan);
    }
}
