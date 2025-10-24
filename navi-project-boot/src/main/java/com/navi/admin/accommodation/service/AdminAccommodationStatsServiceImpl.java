package com.navi.admin.accommodation.service;

import com.navi.admin.accommodation.repository.AdminAccommodationDashboardRepository;
import com.navi.admin.user.dto.AdminDashboardDTO;
import com.navi.admin.util.DashboardUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAccommodationStatsServiceImpl implements AdminAccommodationStatsService {
    private final AdminAccommodationDashboardRepository adminAccommodationDashboardRepository;

    @Override
    public AdminDashboardDTO.Accommodations getMonthlyAccommodationStats() {
        LocalDate now = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(now);
        YearMonth prevMonth = currentMonth.minusMonths(1);

        // 이번 달 기간
        LocalDateTime start = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime end = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        // 지난 달 기간
        LocalDateTime prevStart = prevMonth.atDay(1).atStartOfDay();
        LocalDateTime prevEnd = prevMonth.atEndOfMonth().atTime(23, 59, 59);

        // 이번 달 숙소 등록 수 & 조회수
        long count = adminAccommodationDashboardRepository.countCreatedBetween(start, end);
        long views = adminAccommodationDashboardRepository.sumViewsBetween(start, end);

        // 지난 달 조회수
        long prevViews = adminAccommodationDashboardRepository.sumViewsBetween(prevStart, prevEnd);

        // 증감률 계산
        double changedPct = DashboardUtils.calcPctChange(views, prevViews);

        return AdminDashboardDTO.Accommodations.builder()
                .count(count)
                .changedPct(changedPct)
                .build();
    }
}
