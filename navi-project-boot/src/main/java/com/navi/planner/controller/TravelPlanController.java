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
import com.navi.user.dto.users.UserSecurityDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    // ======================================================
    // ✅ [1] 여행계획 등록 (Create)
    // ------------------------------------------------------
    @PostMapping("/planner")
    public ResponseEntity<Long> savePlan(
            @RequestBody TravelPlanRequestDTO dto) {

        String userId = getUserIdFromSecurityContext();
        if (userId == null) {
            log.warn("⚠️ [savePlan] 인증되지 않은 사용자 요청");
            return ResponseEntity.status(401).build();
        }

        try {
            log.info("✅ [POST /api/plans/planner] userId={}, title={}", userId, dto.getTitle());
            Long planId = travelPlanService.savePlan(userId, dto);
            return ResponseEntity.ok(planId);
        } catch (Exception e) {
            log.error("❌ 여행계획 저장 중 오류", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ======================================================
    // ✅ [2] 내 여행계획 목록 조회 (List)
    // ------------------------------------------------------
    @GetMapping
    public ResponseEntity<List<TravelPlanListResponseDTO>> getMyPlans() {
        String userId = getUserIdFromSecurityContext();
        if (userId == null) {
            log.warn("⚠️ [getMyPlans] 인증되지 않은 사용자 요청");
            return ResponseEntity.status(401).build();
        }

        List<TravelPlanListResponseDTO> list = travelPlanQueryService.getMyPlans(userId);
        return ResponseEntity.ok(list);
    }

    // ======================================================
    // ✅ [3] 여행계획 상세 조회 (Detail View)
    // ------------------------------------------------------
    @GetMapping("/planner/{planId}")
    public ResponseEntity<TravelPlanDetailResponseDTO> getPlanDetail(
            @PathVariable("planId") Long planId) {

        String userId = getUserIdFromSecurityContext();
        if (userId == null) {
            log.warn("⚠️ [getPlanDetail] 인증되지 않은 사용자 요청");
            return ResponseEntity.status(401).build();
        }

        TravelPlanDetailResponseDTO detail = travelPlanQueryService.getPlanDetail(planId, userId);
        return ResponseEntity.ok(detail);
    }

    // ======================================================
    // ✅ [4] 여행계획 수정 (Edit)
    // ------------------------------------------------------
    @PutMapping("/schedule/{planId}")
    public ResponseEntity<?> updatePlan(
            @PathVariable Long planId,
            @RequestBody TravelPlanRequestDTO dto) {

        String userId = getUserIdFromSecurityContext();
        if (userId == null) {
            log.warn("⚠️ [updatePlan] 인증되지 않은 사용자 요청");
            return ResponseEntity.status(401).build();
        }

        try {
            log.info("📝 [PUT /api/plans/schedule/{}] userId={}, title={}", planId, userId, dto.getTitle());
            travelPlanService.updatePlan(planId, userId, dto);
            return ResponseEntity.ok("수정 완료");
        } catch (Exception e) {
            log.error("❌ 여행계획 수정 중 오류", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ======================================================
    // ✅ [5] 여행계획 삭제 (Delete)
    // ------------------------------------------------------
    @DeleteMapping("/{planId}")
    public ResponseEntity<?> deletePlan(@PathVariable Long planId) {
        travelPlanService.deletePlan(planId);
        return ResponseEntity.ok("삭제 완료");
    }

    // ======================================================
    // ✅ [6] 여행지 목록 (Planner 내부용)
    // ------------------------------------------------------
    @GetMapping("/travel/list")
    public ResponseEntity<List<TravelListResponseDTO>> getTravelList() {
        List<Travel> travels = travelService.getTravelList();
        List<TravelListResponseDTO> responseList = travels.stream()
                .map(TravelListResponseDTO::of)
                .toList();
        return ResponseEntity.ok(responseList);
    }

    // ======================================================
    // ✅ [7] 숙소 목록 (Planner 내부용)
    // ------------------------------------------------------
    @GetMapping("/stay/list")
    public ResponseEntity<List<AccListResponseDTO>> getStayList() {
        List<Acc> accList = accService.getAllAcc();
        List<AccListResponseDTO> stays = accList.stream()
                .map(AccListResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(stays);
    }

    // ======================================================
    // ✅ SecurityContext에서 로그인 사용자 ID 추출
    // ------------------------------------------------------
    private String getUserIdFromSecurityContext() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return null;
            }

            Object principal = auth.getPrincipal();

            if (principal instanceof UserSecurityDTO user) {
                return user.getId();
            }

            if (principal instanceof JWTClaimDTO claim) {
                return claim.getId();
            }

            if (principal instanceof String str && !"anonymousUser".equals(str)) {
                return str;
            }

        } catch (Exception e) {
            log.warn("⚠️ 사용자 인증 정보 추출 실패: {}", e.getMessage());
        }
        return null;
    }
}
