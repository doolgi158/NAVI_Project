//package com.navi.admin.travel.controller;
//
//import com.navi.admin.travel.service.AdminTravelDashboardService;
//import com.navi.common.response.ApiResponse;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/api/adm")
//@RequiredArgsConstructor
//public class AdminTravelDashboardController {
//    private final AdminTravelDashboardService dashboardService;
//
//    // 여행지 요약 (등록된 개수, 조회수 등)
//    @GetMapping("/travelDashboard")
//    public ResponseEntity<?> getTravelDashboard() {
//        var stats = dashboardService.getMonthlyTravelStats();
//        return ResponseEntity.ok(ApiResponse.success(stats));
//    }
//
//    // 인기 여행지 TOP5
//    @GetMapping("/travelRanking")
//    public ResponseEntity<?> getTravelRanking() {
//        var rankingList = dashboardService.getTopTravelRank();
//        return ResponseEntity.ok(ApiResponse.success(rankingList));
//    }
//}
