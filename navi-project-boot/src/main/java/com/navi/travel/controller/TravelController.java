//package com.navi.travel.controller;
//
//import com.navi.travel.dto.TravelDetailResponseDTO;
//import com.navi.travel.dto.TravelListResponseDTO;
//import com.navi.travel.service.TravelService;
//import com.navi.user.dto.JWTClaimDTO;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.domain.Sort;
//import org.springframework.data.web.PageableDefault;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Arrays;
//import java.util.List;
//import java.util.NoSuchElementException;
//import java.util.stream.Collectors;
//
//@Slf4j
//@RestController
//@RequestMapping("/api/travel")
//@RequiredArgsConstructor
//public class TravelController {
//
//    private final TravelService travelService;
//
//    // ✅ SecurityContext에서 사용자 ID 추출 메서드
//    private String getUserIdFromSecurityContext() {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof JWTClaimDTO claim) {
//            return claim.getId();
//        }
//        return null;
//    }
//
//    /** ✅ 1. 여행지 목록 조회 */
//    @GetMapping
//    public Page<TravelListResponseDTO> getList(
//            @PageableDefault(size = 10, sort = "contentsCd", direction = Sort.Direction.DESC) Pageable pageable,
//            @RequestParam(value = "region2Name", required = false) String region2NameCsv,
//            @RequestParam(value = "categoryName", required = false) String categoryName,
//            @RequestParam(value = "search", required = false) String search
//    ) {
//        List<String> region2Names = null;
//
//        if (region2NameCsv != null && !region2NameCsv.isEmpty()) {
//            region2Names = Arrays.stream(region2NameCsv.split(","))
//                    .map(String::trim)
//                    .filter(s -> !s.isEmpty())
//                    .collect(Collectors.toList());
//        }
//
//        return travelService.getTravelList(pageable, region2Names, categoryName, search, true);
//    }
//
//    /** ✅ 2. 여행지 상세 조회 */
//    @GetMapping("/detail/{travelId}")
//    public ResponseEntity<TravelDetailResponseDTO> getTravelDetail(
//            @PathVariable("travelId") Long travelId
//    ) {
//        try {
//            String userId = getUserIdFromSecurityContext(); // ✅ 로그인 유저 확인
//            log.info("🟦 [Controller] travelId={}, userId={}", travelId, userId);
//
//            TravelDetailResponseDTO detailDTO = travelService.getTravelDetail(travelId, userId);
//            return ResponseEntity.ok(detailDTO);
//        } catch (NoSuchElementException e) {
//            return ResponseEntity.notFound().build();
//        } catch (Exception e) {
//            log.error("❌ 상세 정보 조회 중 서버 오류: {}", e.getMessage());
//            return ResponseEntity.internalServerError().build();
//        }
//    }
//
//    /** ✅ 3. 조회수 증가 */
//    @PostMapping("/views/{travelId}")
//    public ResponseEntity<Void> incrementViews(@PathVariable("travelId") Long travelId) {
//        try {
//            travelService.incrementViews(travelId);
//            return ResponseEntity.noContent().build();
//        } catch (Exception e) {
//            log.error("❌ 조회수 증가 중 오류: {}", e.getMessage());
//            return ResponseEntity.internalServerError().build();
//        }
//    }
//
//    /** ✅ 4. 좋아요 토글 */
//    @PostMapping("/like/{travelId}")
//    public ResponseEntity<String> toggleLike(@PathVariable Long travelId) {
//        String userId = getUserIdFromSecurityContext();
//        log.info("❤️ [Like] travelId={}, userId={}", travelId, userId);
//
//        try {
//            boolean isAdded = travelService.toggleLike(travelId, userId);
//            return ResponseEntity.ok(isAdded ? "좋아요 추가" : "좋아요 취소");
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        } catch (Exception e) {
//            return ResponseEntity.internalServerError().body("서버 오류: " + e.getMessage());
//        }
//    }
//
//    /** ✅ 5. 북마크 토글 */
//    @PostMapping("/bookmark/{travelId}")
//    public ResponseEntity<String> toggleBookmark(@PathVariable Long travelId) {
//        String userId = getUserIdFromSecurityContext();
//        log.info("📚 [Bookmark] travelId={}, userId={}", travelId, userId);
//
//        try {
//            boolean isAdded = travelService.toggleBookmark(travelId, userId);
//            return ResponseEntity.ok(isAdded ? "북마크 추가" : "북마크 취소");
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        } catch (Exception e) {
//            return ResponseEntity.internalServerError().body("서버 오류: " + e.getMessage());
//        }
//    }
//}
