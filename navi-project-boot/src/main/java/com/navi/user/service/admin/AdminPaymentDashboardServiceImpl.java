package com.navi.user.service.admin;

import com.navi.user.dto.admin.AdminDashboardDTO;
import com.navi.user.repository.DashboardPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminPaymentDashboardServiceImpl implements AdminPaymentDashboardService {
    private final DashboardPaymentRepository dashboardPaymentRepository;

    @Override
    public AdminDashboardDTO.Payments getPaymentStats(String range) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = getStartDate(range);

        // 결제 건수
        long count = dashboardPaymentRepository.countPaymentsByDateRange(start, end);

        // 결제 총액
        BigDecimal amount = dashboardPaymentRepository.sumAmountByCreatedAtBetween(start, end);
        if (amount == null) amount = BigDecimal.ZERO;

        // 이전 기간 (비교용)
        long periodDays = getPeriodDays(range);
        LocalDateTime prevStart = start.minusDays(periodDays);
        LocalDateTime prevEnd = start;
        BigDecimal prevAmount = dashboardPaymentRepository.sumAmountByCreatedAtBetween(prevStart, prevEnd);
        if (prevAmount == null) prevAmount = BigDecimal.ZERO;

        // 증감률 계산
        double changedPct = calcPctChange(amount.doubleValue(), prevAmount.doubleValue());

        return AdminDashboardDTO.Payments.builder()
                .count(count)
                .amount(amount)
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

    // 기간별 일 수 계산
    private long getPeriodDays(String range) {
        return switch (range.toLowerCase()) {
            case "daily" -> 1;
            case "weekly" -> 7;
            default -> 30;
        };
    }

    // 증감률 계산 (소수점 1자리 반올림)
    private double calcPctChange(double curr, double prev) {
        if (prev == 0) return 0.0;
        return Math.round(((curr - prev) / prev) * 1000.0) / 10.0;
    }
}
