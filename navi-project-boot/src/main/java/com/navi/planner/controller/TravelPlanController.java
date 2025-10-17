package com.navi.planner.controller;

import com.navi.planner.Service.TravelPlanService;
import com.navi.planner.Service.TravelPlanQueryService;
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

    /** ✅ 여행계획 등록 */
    @PostMapping
    public ResponseEntity<?> createPlan(@RequestBody TravelPlanRequestDTO dto,
                                        @AuthenticationPrincipal JWTClaimDTO user) {
        Long userNo = Long.parseLong(user.getId()); // 🔹 getNo() → getId() + 변환
        Long planId = travelPlanService.savePlan(userNo, dto).getId();
        return ResponseEntity.ok(planId);
    }

    /** ✅ 사용자별 여행계획 목록 */
    @GetMapping
    public ResponseEntity<?> getMyPlans(@AuthenticationPrincipal JWTClaimDTO user) {
        Long userNo = Long.parseLong(user.getId());
        List<TravelPlanListResponseDTO> list = travelPlanQueryService.getMyPlans(userNo);
        return ResponseEntity.ok(list);
    }

    /** ✅ 여행계획 상세 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPlanDetail(@PathVariable("id") Long id,
                                           @AuthenticationPrincipal JWTClaimDTO user) {
        Long userNo = Long.parseLong(user.getId());
        TravelPlanDetailResponseDTO detail = travelPlanQueryService.getPlanDetail(id, userNo);
        return ResponseEntity.ok(detail);
    }
}
