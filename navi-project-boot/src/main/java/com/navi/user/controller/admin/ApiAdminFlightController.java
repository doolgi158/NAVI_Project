package com.navi.user.controller.admin;

import com.navi.common.response.ApiResponse;
import com.navi.user.dto.admin.AdminDashboardDTO;
import com.navi.user.service.admin.AdminFlightDashboard;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/adm")
@RequiredArgsConstructor
public class ApiAdminFlightController {
    private final AdminFlightDashboard adminFlightDashboard;

    @GetMapping("/flightDashboard")
    public ResponseEntity<?> getFlightDashboard() {
        AdminDashboardDTO.Flights flightStats = adminFlightDashboard.getFlightStatistics();
        return ResponseEntity.ok(ApiResponse.success(flightStats));
    }
}
