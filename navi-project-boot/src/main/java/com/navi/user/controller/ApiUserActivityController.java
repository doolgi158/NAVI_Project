package com.navi.user.controller;

import com.navi.common.response.ApiResponse;
import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.user.dto.auth.UserSecurityDTO;
import com.navi.user.dto.users.UserMyPageTravelLikeDTO;
import com.navi.user.service.user.UserActivityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
@Slf4j
public class ApiUserActivityController {
    private final UserActivityService userActivityService;

    // 내가 좋아요한 여행지 리스트
    @GetMapping("/likes")
    public ResponseEntity<ApiResponse<List<UserMyPageTravelLikeDTO>>> getLikedTravels(Authentication authentication) {
        try {
            UserSecurityDTO user = (UserSecurityDTO) authentication.getPrincipal();
            Long userNo = user.getNo();
            String userId = user.getId();

            log.info("❤️ [좋아요 여행지 조회 요청] userNo={}, userId={}", userNo, userId);

            List<UserMyPageTravelLikeDTO> likedTravels = userActivityService.getLikedTravels(userNo);

            return ResponseEntity.ok(ApiResponse.success(likedTravels));

        } catch (Exception e) {
            log.error("❌ 좋아요한 여행지 조회 중 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("서버 오류가 발생했습니다.", 500, null));
        }
    }

    // 내가 북마크한 여행지 리스트
    @GetMapping("/bookmarks")
    public ResponseEntity<?> getBookmarkedTravels(@RequestParam Long userNo) {
        List<TravelDetailResponseDTO> bookmarks = userActivityService.getBookmarkedTravels(userNo);
        return ResponseEntity.ok(ApiResponse.success(bookmarks));
    }

    // 여행지 좋아요 취소
    @DeleteMapping("/like/{travelId}")
    public ResponseEntity<?> unlikeTravel(@PathVariable Long travelId, @RequestParam Long userNo) {
        userActivityService.unlikeTravel(userNo, travelId);
        return ResponseEntity.ok(ApiResponse.success("좋아요 취소됨"));
    }

    // 북마크 좋아요 취소
    @DeleteMapping("/bookmark/{travelId}")
    public ResponseEntity<?> unmarkeTravel(@PathVariable Long travelId, @RequestParam Long userNo) {
        userActivityService.unmarkTravel(userNo, travelId);
        return ResponseEntity.ok(ApiResponse.success("북마크 취소됨"));
    }
}
