//package com.navi.user.controller.admin;
//
//import com.navi.common.response.ApiResponse;
//import com.navi.user.dto.admin.AdminDashboardDTO;
//import com.navi.user.service.admin.AdminTravelDashboardService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/api/adm")
//@RequiredArgsConstructor
//public class ApiAdminTravelController {
//    private final AdminTravelDashboardService adminTravelService;
//
//    // 여행지 요약 (등록된 개수, 조회수 등)
//    @GetMapping("/travelDashboard")
//    public ResponseEntity<?> getTravelDashboard() {
//        AdminDashboardDTO.Travels stats = adminTravelService.getTravelStats();
//        return ResponseEntity.ok(ApiResponse.success(stats));
//    }
//
//    // 인기 여행지 TOP5
//    @GetMapping("/travelRanking")
//    public ResponseEntity<?> getTravelRanking() {
//        var rankingList = adminTravelService.getTopTravelRank();
//        return ResponseEntity.ok(ApiResponse.success(rankingList));
//    }
//}
