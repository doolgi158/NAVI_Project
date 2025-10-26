package com.navi.admin.payment.controller;

import com.navi.admin.payment.service.AdminPaymentDashboardService;
import com.navi.admin.user.dto.AdminDashboardDTO;
import com.navi.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/adm")
@RequiredArgsConstructor
public class AdminPaymentDashboardController {
    private final AdminPaymentDashboardService dashboardService;

    // 월간 결제 대시보드
    @GetMapping("/paymentDashboard")
    public ApiResponse<List<AdminDashboardDTO.Payments>> getPaymentDashboard(
            @RequestParam(defaultValue = "6") int months
    ) {
        return ApiResponse.success(dashboardService.getMonthlyPaymentTrend(months));
    }

    @GetMapping("/paymentShare")
    public ApiResponse<List<Map<String, Object>>> getPaymentShare() {
        return ApiResponse.success(dashboardService.getPaymentMethodShare());
    }
}
