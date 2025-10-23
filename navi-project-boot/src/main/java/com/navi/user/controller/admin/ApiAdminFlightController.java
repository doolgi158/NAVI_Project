package com.navi.user.controller.admin;

import com.navi.common.response.ApiResponse;
import com.navi.user.service.admin.AdminFlightDashboard;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/adm")
@RequiredArgsConstructor
public class ApiAdminFlightController {
    private final AdminFlightDashboard adminFlightDashboard;

    @GetMapping("/flightDashboard")
    public ResponseEntity<?> getFlightDashboard(@RequestParam(defaultValue = "monthly") String range) {
        var stats = adminFlightDashboard.getFlightStatistics(range);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
