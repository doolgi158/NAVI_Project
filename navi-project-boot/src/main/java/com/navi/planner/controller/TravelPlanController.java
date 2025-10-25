package com.navi.planner.controller;

import com.navi.common.response.ApiResponse;
import com.navi.planner.dto.TravelPlanDetailResponseDTO;
import com.navi.planner.dto.TravelPlanListResponseDTO;
import com.navi.planner.dto.TravelPlanRequestDTO;
import com.navi.planner.service.TravelPlanQueryService;
import com.navi.planner.service.TravelPlanService;
import com.navi.security.util.JWTUtil;
import com.navi.user.dto.auth.JWTClaimDTO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 여행계획 API 컨트롤러
 * /api/plans
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/plans")
public class TravelPlanController {

    private final TravelPlanService travelPlanService;
    private final TravelPlanQueryService travelPlanQueryService;
    private final JWTUtil jwtUtil;

    /**
     * ✅ [GET] 내 여행계획 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TravelPlanListResponseDTO>>> getMyPlans(HttpServletRequest request) {
        String userId = extractUserId(request);
        log.info("📦 내 여행계획 목록 요청: userId={}", userId);

        List<TravelPlanListResponseDTO> plans = travelPlanQueryService.getMyPlans(userId);
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    /**
     * ✅ [GET] 단일 여행계획 상세
     */
    @GetMapping("/{planId}")
    public ResponseEntity<ApiResponse<TravelPlanDetailResponseDTO>> getPlanDetail(
            @PathVariable Long planId,
            HttpServletRequest request
    ) {
        String userId = extractUserId(request);
        log.info("📦 여행계획 상세 요청: planId={}, userId={}", planId, userId);

        TravelPlanDetailResponseDTO detail = travelPlanQueryService.getPlanDetail(planId, userId);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    /**
     * ✅ [POST] 새 여행계획 저장
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> savePlan(
            HttpServletRequest request,
            @RequestBody TravelPlanRequestDTO dto
    ) {
        String userId = extractUserId(request);
        log.info("🆕 여행계획 저장 요청: userId={}, title={}", userId, dto.getTitle());

        Long planId = travelPlanService.savePlan(userId, dto);
        return ResponseEntity.ok(ApiResponse.success(planId));
    }

    /**
     * ✅ [PUT] 여행계획 수정
     */
    @PutMapping("/{planId}")
    public ResponseEntity<ApiResponse<String>> updatePlan(
            @PathVariable Long planId,
            HttpServletRequest request,
            @RequestBody TravelPlanRequestDTO dto
    ) {
        String userId = extractUserId(request);
        log.info("✏️ 여행계획 수정 요청: planId={}, userId={}", planId, userId);

        travelPlanService.updatePlan(planId, userId, dto);
        return ResponseEntity.ok(ApiResponse.success("수정 완료"));
    }

    /**
     * ✅ [DELETE] 여행계획 삭제
     */
    @DeleteMapping("/{planId}")
    public ResponseEntity<ApiResponse<String>> deletePlan(@PathVariable Long planId) {
        log.info("🗑️ 여행계획 삭제 요청: planId={}", planId);
        travelPlanService.deletePlan(planId);
        return ResponseEntity.ok(ApiResponse.success("삭제 완료"));
    }

    /**
     * ✅ JWT 토큰에서 userId 추출
     */
    private String extractUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization 헤더가 없습니다.");
        }
        String token = header.substring(7);
        JWTClaimDTO claim = jwtUtil.validateAndParse(token);
        return claim.getId();
    }
}
