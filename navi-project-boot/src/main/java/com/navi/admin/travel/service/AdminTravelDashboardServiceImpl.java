package com.navi.admin.travel.service;

import com.navi.admin.travel.repository.AdminTravelDashboardRepository;
import com.navi.admin.user.dto.AdminDashboardDTO;
import com.navi.admin.util.DashboardUtils;
import com.navi.travel.domain.Travel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminTravelDashboardServiceImpl implements AdminTravelDashboardService {

    private final AdminTravelDashboardRepository travelRepository;

    // 여행지 통계 (기간별 range 적용)
    @Override
    public AdminDashboardDTO.Travels getMonthlyTravelStats() {
        LocalDate now = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(now);
        YearMonth prevMonth = currentMonth.minusMonths(1);

        LocalDateTime start = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime end = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        LocalDateTime prevStart = prevMonth.atDay(1).atStartOfDay();
        LocalDateTime prevEnd = prevMonth.atEndOfMonth().atTime(23, 59, 59);

        long currentCount = travelRepository.countCreatedBetween(start, end);
        long currentViews = Optional.ofNullable(travelRepository.sumViewsBetween(start, end)).orElse(0L);
        long prevViews = Optional.ofNullable(travelRepository.sumViewsBetween(prevStart, prevEnd)).orElse(0L);

        double changedPct = DashboardUtils.calcPctChange(currentViews, prevViews);

        return AdminDashboardDTO.Travels.builder()
                .count(currentCount)
                .totalViews(currentViews)
                .changedPct(changedPct)
                .build();
    }

    // 인기 여행지 Top5
    @Override
    public List<Map<String, Object>> getTopTravelRank() {
        List<Travel> topList = travelRepository.findTop5Popular();

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < topList.size(); i++) {
            Travel t = topList.get(i);
            long score = Optional.ofNullable(t.getViews()).orElse(0L)
                    + Optional.ofNullable(t.getLikesCount()).orElse(0L)
                    + Optional.ofNullable(t.getBookmarkCount()).orElse(0L);

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("rank", i + 1);
            map.put("id", t.getTravelId());
            map.put("title", t.getTitle());
            map.put("region", extractRegionName(t.getAddress()));
            map.put("views", Optional.ofNullable(t.getViews()).orElse(0L));
            map.put("likes", Optional.ofNullable(t.getLikesCount()).orElse(0L));
            map.put("bookmarks", Optional.ofNullable(t.getBookmarkCount()).orElse(0L));
            map.put("score", score);
            result.add(map);
        }
        return result;
    }

    // 지역 문자열에서 읍/면/동/리까지만 추출
    private String extractRegionName(String fullRegion) {
        if (fullRegion == null || fullRegion.isBlank()) return "-";

        String[] parts = fullRegion.split(" ");
        int endIndex = -1;

        for (int i = 0; i < parts.length; i++) {
            if (parts[i].endsWith("읍") || parts[i].endsWith("면")
                    || parts[i].endsWith("동") || parts[i].endsWith("리")) {
                endIndex = i;
            }
        }

        if (endIndex >= 0) {
            return String.join(" ", Arrays.copyOfRange(parts, 0, endIndex + 1))
                    .replaceAll("^(.*시\\s)?", "");
        }
        return fullRegion;
    }
}
