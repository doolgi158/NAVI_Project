package com.navi.admin.accommodation.controller;

import com.navi.admin.accommodation.service.AdminAccommodationRankService;
import com.navi.admin.accommodation.service.AdminAccommodationStatsService;
import com.navi.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/adm/accommodation")
@RequiredArgsConstructor
public class AdminAccommodationDashboardController {
    private final AdminAccommodationRankService rankService;
    private final AdminAccommodationStatsService statsService;

    // 월간 숙소 요약 통계
    @GetMapping("/dashboard")
    public ResponseEntity<?> getAccDashboard() {
        var stats = statsService.getMonthlyAccommodationStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // 인기 숙소 TOP5
    @GetMapping("/ranking")
    public ResponseEntity<?> getAccommodationRanking() {
        var rankingList = rankService.getTopAccommodationRank();
        return ResponseEntity.ok(ApiResponse.success(rankingList));
    }
}