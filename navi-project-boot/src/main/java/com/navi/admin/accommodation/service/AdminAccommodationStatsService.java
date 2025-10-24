package com.navi.admin.accommodation.service;

import com.navi.admin.user.dto.AdminDashboardDTO;

public interface AdminAccommodationStatsService {
    AdminDashboardDTO.Accommodations getMonthlyAccommodationStats();
}
