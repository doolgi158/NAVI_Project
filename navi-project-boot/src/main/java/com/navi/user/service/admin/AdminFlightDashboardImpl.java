package com.navi.user.service.admin;

import com.navi.user.dto.admin.AdminDashboardDTO;
import com.navi.user.repository.DashboardFlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminFlightDashboardImpl implements AdminFlightDashboard {
    private final DashboardFlightRepository dashboardFlightRepository;

    @Override
    public AdminDashboardDTO.Flights getFlightStatistics() {
        long totalFlights = dashboardFlightRepository.count();

        // 단순 등록 수만 반환 (추후 전월 대비 증감률 추가 가능)
        return AdminDashboardDTO.Flights.builder()
                .count(totalFlights)
                .changedPct(0)
                .build();
    }
}
