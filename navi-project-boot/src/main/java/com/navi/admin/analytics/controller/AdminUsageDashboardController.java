package com.navi.admin.analytics.controller;

import com.navi.admin.analytics.service.AdminUsageDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adm")
public class AdminUsageDashboardController {
    private final AdminUsageDashboardService usageDashboardService;

    // 여행지 조회수, 숙소 조회수, 항공편 예약량, 짐 배송 예약량 (최근 6개월)
    @GetMapping("/usageDashboard")
    public Map<String, Object> getUsageDashboard() {
        return usageDashboardService.getUsageTrend();
    }
}
