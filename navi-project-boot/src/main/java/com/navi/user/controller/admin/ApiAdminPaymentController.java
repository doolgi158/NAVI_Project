package com.navi.user.controller.admin;

import com.navi.common.response.ApiResponse;
import com.navi.user.dto.admin.AdminDashboardDTO;
import com.navi.user.service.admin.AdminPaymentDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/adm/payments")
@RequiredArgsConstructor
public class ApiAdminPaymentController {

    private final AdminPaymentDashboardService adminPaymentDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDTO.Payments>> getPaymentDashboard() {
        AdminDashboardDTO.Payments stats = adminPaymentDashboardService.getPaymentStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
