package com.navi.user.service.admin;

import com.navi.travel.domain.Travel;
import com.navi.user.dto.admin.AdminDashboardDTO;
import com.navi.user.repository.DashboardTravelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class AdminTravelDashboardServiceImpl implements AdminTravelDashboardService {
    private final DashboardTravelRepository dashboardTravelRepository;

    // 여행지 통계 (기간별 range 적용)
    @Override
    public AdminDashboardDTO.Travels getTravelStats(String range) {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        LocalDateTime end;

        // 범위 계산
        switch (range.toLowerCase()) {
            case "day" -> {
                start = now.minusDays(1).toLocalDate().atStartOfDay();
                end = now.toLocalDate().plusDays(1).atStartOfDay();
            }
            case "week" -> {
                start = now.minusWeeks(1).toLocalDate().atStartOfDay();
                end = now.toLocalDate().plusDays(1).atStartOfDay();
            }
            default -> {
                start = now.minusMonths(1).toLocalDate().atStartOfDay();
                end = now.toLocalDate().plusDays(1).atStartOfDay();
            }
        }
        // 이전 기간(전월) 대비 비교
        LocalDateTime prevStart = LocalDate.now().minusMonths(2).atStartOfDay();
        LocalDateTime prevEnd = LocalDate.now().minusMonths(1).atStartOfDay();

        // 등록된 여행지 수
        long total = Optional.ofNullable(
                dashboardTravelRepository.sumViewsByDateRange(start, end)
        ).orElse(0L);

        // 조회수 합계
        long totalViews = Optional.ofNullable(
                dashboardTravelRepository.sumViewsByDateRange(prevStart, prevEnd)
        ).orElse(0L);

        long prevViews = dashboardTravelRepository.sumViewsByDateRange(prevStart, prevEnd);

        double changedPct = 0.0;
        if (prevViews > 0) {
            changedPct = ((double) (totalViews - prevViews) / prevViews) * 100.0;
        }

        // 반환 DTO
        return AdminDashboardDTO.Travels.builder()
                .count(total)
                .totalViews(totalViews)
                .changedPct(Math.round(changedPct * 10.0) / 10.0)
                .build();
    }

    // 인기 여행지 Top5
    @Override
    public List<Map<String, Object>> getTopTravelRank() {
        List<Travel> topList = dashboardTravelRepository.findTop5Popular();

        return IntStream.range(0, topList.size())
                .mapToObj(i -> {
                    Travel t = topList.get(i);
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("rank", i + 1);
                    map.put("title", t.getTitle());
                    map.put("travelId", t.getTravelId());
                    map.put("region", extractRegionName(t.getAddress()));

                    long score = Optional.ofNullable(t.getViews()).orElse(0L)
                            + Optional.ofNullable(t.getLikesCount()).orElse(0L)
                            + Optional.ofNullable(t.getBookmarkCount()).orElse(0L);

                    map.put("views", Optional.ofNullable(t.getViews()).orElse(0L));
                    map.put("likes", Optional.ofNullable(t.getLikesCount()).orElse(0L));
                    map.put("bookmarks", Optional.ofNullable(t.getBookmarkCount()).orElse(0L));
                    map.put("score", score);
                    return map;
                })
                .toList();
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
                    .replaceAll("^(.*시\\s)?", ""); // 상위 지역 제거
        }
        return fullRegion;
    }
}
