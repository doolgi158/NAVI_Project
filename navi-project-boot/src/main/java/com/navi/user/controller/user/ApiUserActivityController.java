package com.navi.user.controller.user;

import com.navi.common.response.ApiResponse;
import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.user.dto.users.UserSecurityDTO;
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
    public ResponseEntity<ApiResponse<List<TravelDetailResponseDTO>>> getLikedTravels(Authentication authentication) {
        try {
            // 현재 로그인한 사용자 정보 추출
            UserSecurityDTO user = (UserSecurityDTO) authentication.getPrincipal();
            Long userNo = user.getNo();
            String userId = user.getId();

            log.info("❤️ [좋아요 여행지 조회 요청] userNo={}, userId={}", userNo, userId);

            // 서비스 호출
            List<TravelDetailResponseDTO> likedTravels = userActivityService.getLikedTravels(userNo);

            // 응답
            return ResponseEntity.ok(ApiResponse.success(likedTravels));

        } catch (ClassCastException e) {
            log.warn("⚠️ 인증 정보 파싱 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("인증 정보가 올바르지 않습니다.", 401, null));
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
}
