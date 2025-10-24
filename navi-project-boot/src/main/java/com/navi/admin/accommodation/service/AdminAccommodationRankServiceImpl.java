package com.navi.admin.accommodation.service;

import com.navi.accommodation.domain.Acc;
import com.navi.admin.accommodation.repository.AdminAccommodationDashboardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAccommodationRankServiceImpl implements AdminAccommodationRankService {
    private final AdminAccommodationDashboardRepository adminAccommodationDashboardRepository;

    @Override
    public List<Map<String, Object>> getTopAccommodationRank() {
        List<Acc> accList = adminAccommodationDashboardRepository.findAll();

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
