package com.navi.admin.analytics.service;

import com.navi.admin.analytics.repository.AdminUserDashboardRepository;
import com.navi.admin.payment.service.AdminPaymentDashboardService;
import com.navi.admin.user.dto.AdminDashboardDTO;
import com.navi.admin.user.dto.UserTrendDTO;
import com.navi.admin.util.DashboardUtils;
import com.navi.user.enums.UserState;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserDashboardServiceImpl implements AdminUserDashboardService {

    private final AdminPaymentDashboardService paymentDashboardService;
    private final AdminUserDashboardRepository dashboardRepository;

    // 유저 통계 계산
    @Override
    public AdminDashboardDTO getUserStatistics(String range) {
        long totalUsers = dashboardRepository.count();
        long activeUsers = dashboardRepository.countByUserState(UserState.NORMAL);
        long sleepUsers = dashboardRepository.countByUserState(UserState.SLEEP);
        long withdrawUsers = dashboardRepository.countByUserState(UserState.DELETE);

        // 유저 추이 (최근 6개월)
        List<UserTrendDTO> trend = findUserTrend("monthly");
        long currMonthTotal = trend.isEmpty() ? 0 : trend.get(trend.size() - 1).getJoin();
        long prevMonthTotal = trend.size() >= 2 ? trend.get(trend.size() - 2).getJoin() : 0;
        double changedPct = DashboardUtils.calcPctChange(currMonthTotal, prevMonthTotal);

        return AdminDashboardDTO.builder()
                .users(AdminDashboardDTO.Users.builder()
                        .total(totalUsers)
                        .active(activeUsers)
                        .sleep(sleepUsers)
                        .withdraw(withdrawUsers)
                        .changedPct(changedPct)
                        .build())
                .userTrend(trend)
                .travels(new AdminDashboardDTO.Travels(0, 0, 0))
                .accommodations(new AdminDashboardDTO.Accommodations(0, 0))
                .refunds(new AdminDashboardDTO.Refunds(0, 0))
                .usageTrend(List.of())
                .build();
    }

    @Override
    public List<UserTrendDTO> findUserTrend(String range) {
        List<Object[]> result = dashboardRepository.findUserTrendMonthly();
        return result.stream()
                .map(arr -> UserTrendDTO.builder()
                        .period((String) arr[0])
                        .join(((Number) arr[1]).longValue())
                        .leave(((Number) arr[2]).longValue())
                        .active(((Number) arr[3]).longValue())
                        .build())
                .toList();
    }
}
