package com.navi.planner.controller;

import com.navi.planner.service.TravelPlanService;
import com.navi.planner.service.TravelPlanQueryService;
import com.navi.planner.dto.*;
import com.navi.user.dto.JWTClaimDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class TravelPlanController {

    private final TravelPlanService travelPlanService;
    private final TravelPlanQueryService travelPlanQueryService;

    /** ✅ 여행계획 등록 (userId 기준) */
    @PostMapping("/planner")
    public ResponseEntity<Long> savePlan(
            @AuthenticationPrincipal JWTClaimDTO user,
            @RequestBody TravelPlanRequestDTO dto) {

        String userId = user.getId(); // ✅ JWTClaimDTO.id → userId

        Long planId = travelPlanService.savePlan(userId, dto);
        return ResponseEntity.ok(planId);
    }

    /** ✅ 사용자별 여행계획 목록 */
    @GetMapping    public ResponseEntity<?> getMyPlans(@AuthenticationPrincipal JWTClaimDTO user) {
        String userId = user.getId();
        List<TravelPlanListResponseDTO> list = travelPlanQueryService.getMyPlans(userId);
        return ResponseEntity.ok(list);
    }

    /** ✅ 여행계획 상세 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPlanDetail(
            @PathVariable("id") Long planId,
            @AuthenticationPrincipal JWTClaimDTO user) {
        String userId = user.getId();
        TravelPlanDetailResponseDTO detail = travelPlanQueryService.getPlanDetail(planId, userId);
        return ResponseEntity.ok(detail);
    }
}
