package com.navi.user.service.admin;

import com.navi.user.dto.admin.AdminDashboardDTO;

public interface AdminFlightDashboard {
    AdminDashboardDTO.Flights getFlightStatistics();
}
