package com.navi.admin.analytics.service;

import com.navi.admin.analytics.repository.AdminUserDashboardRepository;
import com.navi.admin.user.dto.AdminDashboardDTO;
import com.navi.admin.user.dto.UserTrendDTO;
import com.navi.admin.util.DashboardUtils;
import com.navi.user.enums.UserState;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserDashboardServiceImpl implements AdminUserDashboardService {

    private final AdminUserDashboardRepository dashboardRepository;

    // 유저 통계 계산
    @Override
    public AdminDashboardDTO getUserStatistics(String range) {
        long totalUsers = dashboardRepository.count();
        long activeUsers = dashboardRepository.countByUserState(UserState.NORMAL);
        long sleepUsers = dashboardRepository.countByUserState(UserState.SLEEP);
        long withdrawUsers = dashboardRepository.countByUserState(UserState.DELETE);

        // 유저 추이 (최근 6개월)
        List<UserTrendDTO> trend = findUserTrend(6);
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
    public List<UserTrendDTO> findUserTrend(int months) {
        List<UserTrendDTO> result = new ArrayList<>();

        YearMonth now = YearMonth.now();

        for (int i = months - 1; i >= 0; i--) {
            YearMonth target = now.minusMonths(i);
            LocalDate start = target.atDay(1);
            LocalDate end = target.atEndOfMonth();

            long join = dashboardRepository.countJoinBetween(start.atStartOfDay(), end.atTime(23, 59, 59));
            long leave = dashboardRepository.countLeaveBetween(UserState.DELETE, start.atStartOfDay(), end.atTime(23, 59, 59));
            long active = dashboardRepository.countActiveUsers(UserState.NORMAL);

            result.add(UserTrendDTO.builder()
                    .period(target.toString())
                    .join(join)
                    .leave(leave)
                    .active(active)
                    .build());
        }

        return result;
    }
}
