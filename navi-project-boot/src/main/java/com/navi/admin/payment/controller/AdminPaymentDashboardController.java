package com.navi.admin.payment.controller;

import com.navi.admin.payment.service.AdminPaymentDashboardService;
import com.navi.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/adm")
@RequiredArgsConstructor
public class AdminPaymentDashboardController {
    private final AdminPaymentDashboardService dashboardService;

    // 월간 결제 대시보드 (최근 1개월 + 전월 대비 증감률)
    @GetMapping("/paymentDashboard")
    public ApiResponse<?> getPaymentDashboard() {
        return ApiResponse.success(dashboardService.getMonthlyPaymentStats());
    }
}
