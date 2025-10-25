package com.navi.travel.controller;

import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.dto.TravelRankDTO;
import com.navi.travel.dto.TravelSimpleResponseDTO;
import com.navi.travel.service.TravelService;
import com.navi.travel.service.internal.TravelQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/travel")
@RequiredArgsConstructor
public class TravelController {

    private final TravelService travelService;
    private final TravelQueryService travelQueryService;

    /**
     * ✅ SecurityContext에서 로그인 사용자 ID 추출
     */
    private String getUserIdFromSecurityContext() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return null;
            }

            Object principal = auth.getPrincipal();

            // principal이 UserSecurityDTO인 경우
            if (principal instanceof com.navi.user.dto.users.UserSecurityDTO user) {
                return user.getId();
            }

            // principal이 문자열로 저장된 경우 (예: anonymousUser)
            if (principal instanceof String str && !"anonymousUser".equals(str)) {
                return str;
            }

        } catch (Exception e) {
            log.warn("⚠️ 사용자 인증 정보 추출 실패: {}", e.getMessage());
        }
        return null;
    }

    /**
     * ✅ 1. 여행지 목록 조회
     */
    @GetMapping
    public ResponseEntity<Page<TravelListResponseDTO>> getList(
            @PageableDefault(size = 50, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable, // pageable 범위 강제 지정
            @RequestParam(value = "region2Name", required = false) String region2NameCsv,
            @RequestParam(value = "categoryName", required = false) String categoryName,
            @RequestParam(value = "search", required = false) String search
    ) {
        List<String> region2Names = null;
        if (region2NameCsv != null && !region2NameCsv.isEmpty()) {
            region2Names = Arrays.stream(region2NameCsv.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
        // 로그인 사용자 ID 가져오기
        String userId = getUserIdFromSecurityContext();
        log.info("🟦 [Controller] 여행지 목록 요청 - userId={}, category={}, search={}", userId, categoryName, search);


        Page<TravelListResponseDTO> list = travelService.getTravelList(
                pageable, region2Names, categoryName, search, true, userId
        );

        return ResponseEntity.ok(list);
    }

    @GetMapping("/popular")
    public ResponseEntity<Page<TravelListResponseDTO>> getPopularTravels(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TravelListResponseDTO> result = travelQueryService.getTravelList(
                pageable, null, null, null, true
        );
        return ResponseEntity.ok(result);
    }

    /**
     * ✅ 2. 여행지 상세 조회
     */
    @GetMapping("/detail/{travelId}")
    public ResponseEntity<TravelDetailResponseDTO> getTravelDetail(@PathVariable("travelId") Long travelId) {
        try {
            String userId = getUserIdFromSecurityContext();
            log.info("🟦 [Controller] 여행지 상세조회 요청 - travelId={}, userId={}", travelId, userId);

            TravelDetailResponseDTO detailDTO = travelService.getTravelDetail(travelId, userId);
            return ResponseEntity.ok(detailDTO);

        } catch (NoSuchElementException e) {
            log.warn("⚠️ 여행지 없음: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("❌ 여행지 상세 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 여행플래너 전용 여행지 간단 목록 조회
     */
    @GetMapping("/list")
    public ResponseEntity<List<TravelSimpleResponseDTO>> getSimpleTravelList() {
        List<TravelSimpleResponseDTO> travels = travelService.getSimpleTravelList();
        return ResponseEntity.ok(travels);
    }

    /**
     * ✅ 3. 조회수 증가
     */
    @PostMapping("/views/{travelId}")
    public ResponseEntity<Void> incrementViews(@PathVariable("travelId") Long travelId) {
        try {
            travelService.incrementViews(travelId);
            log.debug("👁 조회수 증가 완료 - travelId={}", travelId);
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            log.error("❌ 조회수 증가 중 오류 (travelId={}): {}", travelId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * ✅ 4. 좋아요 토글
     */
    @PostMapping("/like/{travelId}")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long travelId) {
        String userId = getUserIdFromSecurityContext();
        log.info("❤️ [좋아요 요청] travelId={}, userId={}", travelId, userId);

        try {
            boolean added = travelService.toggleLike(travelId, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("liked", added);
            response.put("message", added ? "좋아요 추가" : "좋아요 취소");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("⚠️ 잘못된 요청: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ 좋아요 처리 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "서버 오류가 발생했습니다."));
        }
    }

    /**
     * ✅ 5. 북마크 토글
     */
    @PostMapping("/bookmark/{travelId}")
    public ResponseEntity<Map<String, Object>> toggleBookmark(@PathVariable Long travelId) {
        String userId = getUserIdFromSecurityContext();
        log.info("📚 [북마크 요청] travelId={}, userId={}", travelId, userId);

        try {
            boolean added = travelService.toggleBookmark(travelId, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookmarked", added);
            response.put("message", added ? "북마크 추가" : "북마크 취소");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("⚠️ 잘못된 요청: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ 북마크 처리 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "서버 오류가 발생했습니다."));
        }
    }

    // 메인 대표 여행지 TOP 10
    @GetMapping("/rank")
    public List<TravelRankDTO> getFeaturedTravels() {
        return travelService.getTop10FeaturedTravels();
    }
}