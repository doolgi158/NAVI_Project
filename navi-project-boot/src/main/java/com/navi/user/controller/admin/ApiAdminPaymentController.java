package com.navi.user.controller.admin;

import com.navi.common.response.ApiResponse;
import com.navi.user.service.admin.AdminPaymentDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/adm")
@RequiredArgsConstructor
public class ApiAdminPaymentController {
    private final AdminPaymentDashboardService adminPaymentDashboardService;

    @GetMapping("/paymentDashboard")
    public ApiResponse<?> getPaymentDashboard(@RequestParam(defaultValue = "month") String range) {
        return ApiResponse.success(adminPaymentDashboardService.getPaymentStats(range));
    }
}
