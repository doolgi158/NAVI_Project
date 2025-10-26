package com.navi.admin.flight.service;

import com.navi.admin.user.dto.AdminDashboardDTO;

public interface AdminFlightDashboardService {
    AdminDashboardDTO.Flights getMonthlyFlightStats();
}
