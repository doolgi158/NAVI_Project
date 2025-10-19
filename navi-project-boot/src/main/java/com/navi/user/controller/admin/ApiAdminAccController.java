package com.navi.user.controller.admin;

import com.navi.common.response.ApiResponse;
import com.navi.user.service.admin.AdminAccDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/adm")
@RequiredArgsConstructor
public class ApiAdminAccController {
    private final AdminAccDashboardService adminAccDashboardService;

    // 관리자 대시보드 - 전체 숙소 수 조회
    @GetMapping("/accommodationDashboard")
    public ApiResponse<Long> getAccommodationCount() {
        long total = adminAccDashboardService.getTotalAccommodationCount();
        return ApiResponse.success(total);
    }
}
