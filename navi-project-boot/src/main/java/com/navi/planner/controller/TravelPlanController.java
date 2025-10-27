//package com.navi.planner.controller;
//
//import com.navi.accommodation.domain.Acc;
//import com.navi.accommodation.dto.response.AccListResponseDTO;
//import com.navi.accommodation.service.AccService;
//import com.navi.planner.dto.*;
//import com.navi.planner.service.TravelPlanQueryServiceImpl;
//import com.navi.planner.service.TravelPlanService;
//import com.navi.travel.domain.Travel;
//import com.navi.travel.dto.TravelListResponseDTO;
//import com.navi.travel.service.TravelService;
//import com.navi.user.dto.users.UserSecurityDTO;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/plans")
//@RequiredArgsConstructor
//@Slf4j
//public class TravelPlanController {
//
//    private final TravelPlanService travelPlanService;
//    private final TravelPlanQueryServiceImpl travelPlanQueryService;
//    private final AccService accService;
//    private final TravelService travelService;
//
//    // ======================================================
//    // ✅ [1] 여행계획 등록 (Create)
//    // ======================================================
//    @PostMapping
//    public ResponseEntity<Long> savePlan(
//            @AuthenticationPrincipal UserSecurityDTO user,
//            @RequestBody TravelPlanRequestDTO dto) {
//        try {
//            String userId = user.getId(); // ✅ userNo 기준
//            log.info("✅ [POST /api/plans/planner] userNo={}, title={}", userId, dto.getTitle());
//            Long planId = travelPlanService.savePlan(String.valueOf(userId), dto);
//            return ResponseEntity.ok(planId);
//        } catch (Exception e) {
//            log.error("❌ 여행계획 저장 중 오류", e);
//            return ResponseEntity.internalServerError().build();
//        }
//    }
//
//    // ======================================================
//    // ✅ [2] 내 여행계획 목록 조회
//    // ======================================================
//    @GetMapping
//    public ResponseEntity<List<TravelPlanListResponseDTO>> getMyPlans(
//            @AuthenticationPrincipal UserSecurityDTO user) {
//        String userId = user.getId(); // ✅ 핵심 수정
//        log.info("📜 [GET /api/plans] userNo={}", userId);
//        List<TravelPlanListResponseDTO> list = travelPlanQueryService.getMyPlans(userId);
//        return ResponseEntity.ok(list);
//    }
//
//    // ======================================================
//    // ✅ [3] 여행계획 상세 조회
//    // ======================================================
//    @GetMapping("/planner/{planId}")
//    public ResponseEntity<TravelPlanDetailResponseDTO> getPlanDetail(
//            @PathVariable("planId") Long planId,
//            @AuthenticationPrincipal UserSecurityDTO user) {
//        String userId = user.getId();
//        TravelPlanDetailResponseDTO detail = travelPlanQueryService.getPlanDetail(planId, userId);
//        return ResponseEntity.ok(detail);
//    }
//
//    // ======================================================
//    // ✅ [4] 여행계획 수정
//    // ======================================================
//    @PutMapping("/schedule/{planId}")
//    public ResponseEntity<?> updatePlan(
//            @PathVariable Long planId,
//            @AuthenticationPrincipal UserSecurityDTO user,
//            @RequestBody TravelPlanRequestDTO dto) {
//        try {
//            String userId = user.getId();
//            log.info("📝 [PUT /api/plans/schedule/{}] userNo={}, title={}", planId, userId, dto.getTitle());
//            travelPlanService.updatePlan(planId, String.valueOf(userId), dto);
//            return ResponseEntity.ok("수정 완료");
//        } catch (Exception e) {
//            log.error("❌ 여행계획 수정 중 오류", e);
//            return ResponseEntity.internalServerError().build();
//        }
//    }
//
//    // ======================================================
//    // ✅ [5] 여행계획 삭제
//    // ======================================================
//    @DeleteMapping("/{planId}")
//    public ResponseEntity<?> deletePlan(@PathVariable Long planId) {
//        travelPlanService.deletePlan(planId);
//        return ResponseEntity.ok("삭제 완료");
//    }
//
//    // ======================================================
//    // ✅ [6] 여행지 목록 (Planner 내부용)
//    // ======================================================
//    @GetMapping("/travel/list")
//    public ResponseEntity<List<TravelListResponseDTO>> getTravelList() {
//        List<Travel> travels = travelService.getTravelList();
//        List<TravelListResponseDTO> responseList = travels.stream()
//                .map(TravelListResponseDTO::of)
//                .toList();
//        return ResponseEntity.ok(responseList);
//    }
//
//    // ======================================================
//    // ✅ [7] 숙소 목록 (Planner 내부용)
//    // ======================================================
//    @GetMapping("/stay/list")
//    public ResponseEntity<List<AccListResponseDTO>> getStayList() {
//        List<Acc> accList = accService.getAllAcc();
//        List<AccListResponseDTO> stays = accList.stream()
//                .map(AccListResponseDTO::fromEntity)
//                .toList();
//        return ResponseEntity.ok(stays);
//    }
//}
