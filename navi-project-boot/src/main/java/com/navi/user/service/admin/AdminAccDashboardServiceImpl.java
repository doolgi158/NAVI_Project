package com.navi.user.service.admin;

import com.navi.user.repository.DashboardAccRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAccDashboardServiceImpl implements AdminAccDashboardService {
    private final DashboardAccRepository dashboardAccRepository;

    // 전체 숙소 수 반환
    public long getTotalAccommodationCount() {
        return dashboardAccRepository.count();
    }
}
