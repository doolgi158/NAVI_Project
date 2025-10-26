package com.navi.planner.controller;

import com.navi.planner.dto.admin.AdminTravelPlanDetailResponseDTO;
import com.navi.planner.dto.admin.AdminTravelPlanListResponseDTO;
import com.navi.planner.service.AdminTravelPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/adm/plan")
@RequiredArgsConstructor
public class AdminTravelPlanController {

    private final AdminTravelPlanService adminTravelPlanService;

    /**
     * ✅ 전체 여행계획 목록 (페이징 + 검색)
     * 프론트 Table에서 pagination이 정확히 작동하도록 totalElements, totalPages 명시적 포함
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPlans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        Page<AdminTravelPlanListResponseDTO> plans = adminTravelPlanService.getAllPlans(page, size, search);

        // ✅ 프론트가 바로 사용할 수 있도록 구조화
        Map<String, Object> response = new HashMap<>();
        response.put("content", plans.getContent());
        response.put("page", plans.getNumber());
        response.put("size", plans.getSize());
        response.put("totalElements", plans.getTotalElements());
        response.put("totalPages", plans.getTotalPages());
        response.put("first", plans.isFirst());
        response.put("last", plans.isLast());

        return ResponseEntity.ok(response);
    }

    /**
     * ✅ 상세 조회
     */
    @GetMapping("/{planId}")
    public ResponseEntity<AdminTravelPlanDetailResponseDTO> getPlanDetail(@PathVariable Long planId) {
        return ResponseEntity.ok(adminTravelPlanService.getPlanDetail(planId));
    }

    /**
     * ✅ 개별 삭제
     */
    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long planId) {
        adminTravelPlanService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }
}
