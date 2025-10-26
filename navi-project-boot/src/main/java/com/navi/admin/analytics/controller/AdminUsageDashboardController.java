package com.navi.admin.analytics.controller;

import com.navi.admin.analytics.service.AdminUsageDashboardService;
import com.navi.admin.analytics.service.AdminUserDashboardService;
import com.navi.admin.user.dto.UserTrendDTO;
import com.navi.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adm")
public class AdminUsageDashboardController {
    private final AdminUsageDashboardService usageDashboardService;
    private final AdminUserDashboardService userDashboardService;

    // 여행지 조회수, 숙소 조회수, 항공편 예약량, 짐 배송 예약량 (최근 6개월)
    @GetMapping("/usageDashboard")
    public ApiResponse<Map<String, Object>> getUsageDashboard() {
        return ApiResponse.success(usageDashboardService.getUsageTrend());
    }

    @GetMapping("/userTrend")
    public ApiResponse<List<UserTrendDTO>> getUserTrend(@RequestParam(defaultValue = "6") int months) {
        log.info("📊 [UserTrendController] 유저 트렌드 요청: 최근 {}개월", months);

        List<UserTrendDTO> trendList = userDashboardService.findUserTrend(months);

        // 상세 로그 출력
        log.info("✅ [UserTrendController] 결과 건수: {}", trendList.size());
        trendList.forEach(dto ->
                log.debug("   ▶ 기간: {}, 가입: {}, 탈퇴: {}, 활성: {}",
                        dto.getPeriod(), dto.getJoin(), dto.getLeave(), dto.getActive())
        );

        return ApiResponse.success(trendList);
    }
}
