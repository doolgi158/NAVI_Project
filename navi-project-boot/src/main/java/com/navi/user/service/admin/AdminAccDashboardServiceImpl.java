package com.navi.user.service.admin;

import com.navi.accommodation.domain.Acc;
import com.navi.user.repository.DashboardAccRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAccDashboardServiceImpl implements AdminAccDashboardService {
    private final DashboardAccRepository dashboardAccRepository;

    // 전체 숙소 수 반환
    public long getTotalAccommodationCount() {
        return dashboardAccRepository.count();
    }

    @Override
    public List<Map<String, Object>> getTopTravelRank() {
        // 전체 숙소 조회
        List<Acc> accList = dashboardAccRepository.findAll();

        if (accList.isEmpty()) {
            log.warn("⚠️ 숙소 데이터가 없습니다.");
            return Collections.emptyList();
        }

        // 조회수 기준 내림차순 정렬
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
