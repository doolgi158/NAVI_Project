package com.navi.user.controller.admin;

import com.navi.common.response.ApiResponse;
import com.navi.user.service.admin.AdminAccDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/adm")
@RequiredArgsConstructor
public class ApiAdminAccController {
    private final AdminAccDashboardService adminAccDashboardService;

    // 관리자 대시보드 - 전체 숙소 수 조회
    @GetMapping("/accommodationDashboard")
    public ApiResponse<?> getAccDashboard(@RequestParam(defaultValue = "month") String range) {
        return ApiResponse.success(adminAccDashboardService.getAccommodationStats(range));
    }

    // 인기 여행지 TOP5
    @GetMapping("/accommodationRanking")
    public ResponseEntity<?> getTravelRanking() {
        var rankingList = adminAccDashboardService.getTopTravelRank();
        return ResponseEntity.ok(ApiResponse.success(rankingList));
    }
}