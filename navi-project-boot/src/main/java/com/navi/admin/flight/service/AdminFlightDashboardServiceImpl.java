package com.navi.admin.flight.service;

import com.navi.admin.flight.repository.AdminFlightDashboardRepository;
import com.navi.admin.user.dto.AdminDashboardDTO;
import com.navi.admin.util.DashboardUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class AdminFlightDashboardServiceImpl implements AdminFlightDashboardService {
    private final AdminFlightDashboardRepository flightRepository;

    @Override
    public AdminDashboardDTO.Flights getMonthlyFlightStats() {
        LocalDate now = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(now);
        YearMonth prevMonth = currentMonth.minusMonths(1);

        LocalDateTime start = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime end = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        LocalDateTime prevStart = prevMonth.atDay(1).atStartOfDay();
        LocalDateTime prevEnd = prevMonth.atEndOfMonth().atTime(23, 59, 59);

        long currentCount = flightRepository.countCreatedBetween(start, end);
        long prevCount = flightRepository.countCreatedBetween(prevStart, prevEnd);

        double changedPct = DashboardUtils.calcPctChange(currentCount, prevCount);

        return AdminDashboardDTO.Flights.builder()
                .count(currentCount)
                .changedPct(changedPct)
                .build();
    }
}
