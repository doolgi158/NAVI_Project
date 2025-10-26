package com.navi.planner.service;

import com.navi.planner.domain.TravelPlan;
import com.navi.planner.dto.admin.AdminTravelPlanDetailResponseDTO;
import com.navi.planner.dto.admin.AdminTravelPlanListResponseDTO;
import com.navi.planner.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminTravelPlanServiceImpl implements AdminTravelPlanService {

    private final TravelPlanRepository travelPlanRepository;

    /**
     * ✅ 전체 여행계획 조회 (검색 + 페이징)
     */
    @Override
    public Page<AdminTravelPlanListResponseDTO> getAllPlans(int page, int size, String search) {
        log.info("📋 [관리자] 여행계획 목록 조회 (page={}, size={}, search={})", page, size, search);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<TravelPlan> planPage;

        if (StringUtils.hasText(search)) {
            // ✅ 제목 또는 작성자 이름으로 검색
            planPage = travelPlanRepository.findByTitleContainingIgnoreCaseOrUser_NameContainingIgnoreCase(search, search, pageable);
        } else {
            // ✅ 전체 조회
            planPage = travelPlanRepository.findAll(pageable);
        }

        // ✅ DTO 변환
        List<AdminTravelPlanListResponseDTO> dtoList = planPage.getContent().stream()
                .map(AdminTravelPlanListResponseDTO::of)
                .collect(Collectors.toList());

        // ✅ PageImpl로 반환 (totalElements 포함)
        return new PageImpl<>(dtoList, pageable, planPage.getTotalElements());
    }

    /**
     * ✅ 상세 조회 (Day, Item 포함)
     */
    @Override
    public AdminTravelPlanDetailResponseDTO getPlanDetail(Long planId) {
        TravelPlan plan = travelPlanRepository.findByIdWithDaysAndItems(planId)
                .orElseThrow(() -> new NoSuchElementException("해당 여행계획이 존재하지 않습니다."));

        return AdminTravelPlanDetailResponseDTO.of(plan);
    }

    /**
     * ✅ 여행계획 삭제
     */
    @Override
    @Transactional
    public void deletePlan(Long planId) {
        log.warn("🗑 [관리자] 여행계획 삭제 요청 - planId={}", planId);
        if (!travelPlanRepository.existsById(planId)) {
            throw new NoSuchElementException("삭제할 여행계획을 찾을 수 없습니다.");
        }
        travelPlanRepository.deleteById(planId);
    }
}
