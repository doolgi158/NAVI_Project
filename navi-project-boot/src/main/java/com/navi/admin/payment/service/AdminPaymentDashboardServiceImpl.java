package com.navi.admin.payment.service;

import com.navi.admin.payment.repository.AdminPaymentDashboardRepository;
import com.navi.admin.user.dto.AdminDashboardDTO;
import com.navi.admin.util.DashboardUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class AdminPaymentDashboardServiceImpl implements AdminPaymentDashboardService {
    private final AdminPaymentDashboardRepository paymentRepository;

    @Override
    public AdminDashboardDTO.Payments getMonthlyPaymentStats() {
        LocalDate now = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(now);
        YearMonth prevMonth = currentMonth.minusMonths(1);

        LocalDateTime start = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime end = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        LocalDateTime prevStart = prevMonth.atDay(1).atStartOfDay();
        LocalDateTime prevEnd = prevMonth.atEndOfMonth().atTime(23, 59, 59);

        long currentCount = paymentRepository.countPaidPaymentsBetween(start, end);
        BigDecimal currentAmount = paymentRepository.sumPaidAmountBetween(start, end);
        BigDecimal prevAmount = paymentRepository.sumPaidAmountBetween(prevStart, prevEnd);

        double changedPct = DashboardUtils.calcPctChange(
                currentAmount != null ? currentAmount.doubleValue() : 0.0,
                prevAmount != null ? prevAmount.doubleValue() : 0.0
        );

        return AdminDashboardDTO.Payments.builder()
                .count(currentCount)
                .amount(currentAmount == null ? BigDecimal.ZERO : currentAmount)
                .changedPct(changedPct)
                .build();
    }
}
