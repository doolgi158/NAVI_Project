package com.navi.planner.controller;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.response.AccListResponseDTO;
import com.navi.accommodation.service.AccService;
import com.navi.planner.dto.*;
import com.navi.planner.service.TravelPlanQueryService;
import com.navi.planner.service.TravelPlanService;
import com.navi.travel.domain.Travel;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.service.TravelService;
import com.navi.user.dto.JWTClaimDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
@Slf4j
public class TravelPlanController {

    private final TravelPlanService travelPlanService;
    private final TravelPlanQueryService travelPlanQueryService;
    private final AccService accService;
    private final TravelService travelService;

    /** ✅ 여행계획 등록 (기존 /planner → / 로 변경) */
    @PostMapping
    public ResponseEntity<Long> savePlan(
            @AuthenticationPrincipal JWTClaimDTO user,
            @RequestBody TravelPlanRequestDTO dto) {

        try {
            String userId = user.getId(); // JWTClaimDTO.id → userId
            log.info("✅ [POST /api/plans] userId={}, title={}", userId, dto.getTitle());
            Long planId = travelPlanService.savePlan(userId, dto);
            return ResponseEntity.ok(planId);
        } catch (Exception e) {
            log.error("❌ 여행계획 저장 중 오류", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /** ✅ 사용자별 여행계획 목록 */
    @GetMapping
    public ResponseEntity<List<TravelPlanListResponseDTO>> getMyPlans(
            @AuthenticationPrincipal JWTClaimDTO user) {
        String userId = user.getId();
        List<TravelPlanListResponseDTO> list = travelPlanQueryService.getMyPlans(userId);
        return ResponseEntity.ok(list);
    }

    /** ✅ 여행계획 상세 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<TravelPlanDetailResponseDTO> getPlanDetail(
            @PathVariable("id") Long planId,
            @AuthenticationPrincipal JWTClaimDTO user) {
        String userId = user.getId();
        TravelPlanDetailResponseDTO detail = travelPlanQueryService.getPlanDetail(planId, userId);
        return ResponseEntity.ok(detail);
    }

    /** ✅ 여행지 목록 조회 */
    @GetMapping("/travel/list")
    public ResponseEntity<List<TravelListResponseDTO>> getTravelList() {
        List<Travel> travels = travelService.getTravelList();
        List<TravelListResponseDTO> responseList = travels.stream()
                .map(TravelListResponseDTO::of)
                .toList();
        return ResponseEntity.ok(responseList);
    }

    /** ✅ 숙소 목록 조회 */
    @GetMapping("/stay/list")
    public ResponseEntity<List<AccListResponseDTO>> getStayList() {
        List<Acc> accList = accService.getAllAcc();
        List<AccListResponseDTO> stays = accList.stream()
                .map(AccListResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(stays);
    }

    /**여행 계획 삭제*/
    @DeleteMapping("/{planId}")
    public ResponseEntity<?> deletePlan(@PathVariable Long planId) {
        travelPlanService.deletePlan(planId);
        return ResponseEntity.ok("삭제 완료");
    }
}


