package com.navi.user.controller.user;

import com.navi.common.response.ApiResponse;
import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.user.service.user.UserActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
public class ApiUserActivityController {
    private final UserActivityService userActivityService;

    // 내가 좋아요한 여행지 리스트
    @GetMapping("/likes")
    public ResponseEntity<?> getLikedTravels(@RequestParam Long userNo) {
        List<TravelDetailResponseDTO> likedTravels = userActivityService.getLikedTravels(userNo);
        return ResponseEntity.ok(ApiResponse.success(likedTravels));
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
