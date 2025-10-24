package com.navi.admin.flight.controller;

import com.navi.admin.flight.service.AdminFlightDashboardService;
import com.navi.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/adm")
@RequiredArgsConstructor
public class AdminFlightDashboardController {
    private final AdminFlightDashboardService dashboardService;

    @GetMapping("/flightDashboard")
    public ResponseEntity<?> getFlightDashboard() {
        var stats = dashboardService.getMonthlyFlightStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
