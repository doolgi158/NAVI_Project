package com.navi.user.service.admin;

import com.navi.user.dto.admin.AdminDashboardDTO;
import com.navi.user.repository.DashboardFlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminFlightDashboardImpl implements AdminFlightDashboard {
    private final DashboardFlightRepository dashboardFlightRepository;

    @Override
    public AdminDashboardDTO.Flights getFlightStats(String range) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = getStartDate(range);

        // 현재 기간의 항공편 등록 수
        long count = dashboardFlightRepository.countByCreatedAtBetween(start, end);

        // 이전 기간 (비교용)
        LocalDateTime prevStart = start.minusDays(getPeriodDays(range));
        LocalDateTime prevEnd = start;
        long prevCount = dashboardFlightRepository.countByCreatedAtBetween(prevStart, prevEnd);

        // 증감률 계산
        double changedPct = calcPctChange(count, prevCount);

        return AdminDashboardDTO.Flights.builder()
                .count(count)
                .changedPct(changedPct)
                .build();
    }

    // 기간별 시작일 계산
    private LocalDateTime getStartDate(String range) {
        switch (range.toLowerCase()) {
            case "daily":
                return LocalDateTime.now().minusDays(1);
            case "weekly":
                return LocalDateTime.now().minusWeeks(1);
            case "monthly":
            default:
                return LocalDateTime.now().minusMonths(1);
        }
    }

    // 비교용 기간 길이 계산
    private long getPeriodDays(String range) {
        return switch (range.toLowerCase()) {
            case "daily" -> 1;
            case "weekly" -> 7;
            default -> 30;
        };
    }

    // 증감률 계산 (소수점 1자리 반올림)
    private double calcPctChange(long curr, long prev) {
        if (prev == 0) return 0.0;
        return Math.round(((double) (curr - prev) / prev) * 1000.0) / 10.0;
    }
}
