package com.navi.user.service.admin;

import com.navi.accommodation.domain.Acc;
import com.navi.user.dto.admin.AdminDashboardDTO;
import com.navi.user.repository.DashboardAccRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAccDashboardServiceImpl implements AdminAccDashboardService {
    private final DashboardAccRepository dashboardAccRepository;

    // 전체 숙소 수 반환
    @Override
    public AdminDashboardDTO.Accommodations getAccommodationStats(String range) {
        LocalDateTime start = getStartDate(range);
        LocalDateTime end = LocalDateTime.now();

        // 현재 기간 숙소 등록 수 & 조회수
        long count = dashboardAccRepository.countByCreatedAtBetween(start, end);
        long views = dashboardAccRepository.sumViewsByDateRange(start, end);

        // 이전 기간 비교용
        LocalDateTime prevStart = start.minusDays(getPeriodDays(range));
        LocalDateTime prevEnd = start;
        long prevViews = dashboardAccRepository.sumViewsByDateRange(prevStart, prevEnd);

        // 증감률 계산
        double changedPct = calcPctChange(views, prevViews);

        return AdminDashboardDTO.Accommodations.builder()
                .count(count)
                .changedPct(changedPct)
                .build();
    }

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

    private long getPeriodDays(String range) {
        return switch (range.toLowerCase()) {
            case "daily" -> 1;
            case "weekly" -> 7;
            default -> 30;
        };
    }

    private double calcPctChange(long curr, long prev) {
        if (prev == 0) return 0.0;
        return Math.round(((double) (curr - prev) / prev) * 1000.0) / 10.0;
    }

    // 인기 숙소 TOP5 (조회수 기준)
    @Override
    public List<Map<String, Object>> getTopTravelRank() {
        List<Acc> accList = dashboardAccRepository.findAll();

        if (accList.isEmpty()) {
            log.warn("⚠️ 숙소 데이터가 없습니다.");
            return Collections.emptyList();
        }

        return accList.stream()
                .sorted(Comparator.comparingLong((Acc a) ->
                        Optional.ofNullable(a.getViewCount()).orElse(0L)).reversed())
                .limit(5)
                .map(acc -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", acc.getAccId());
                    map.put("title", acc.getTitle());
                    map.put("region", acc.getTownship() != null ? acc.getTownship().getTownshipName() : "-");
                    map.put("views", Optional.ofNullable(acc.getViewCount()).orElse(0L));
                    return map;
                })
                .collect(Collectors.toList());
    }
}
