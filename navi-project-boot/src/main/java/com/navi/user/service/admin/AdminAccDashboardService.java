package com.navi.user.service.admin;

import com.navi.user.dto.admin.AdminDashboardDTO;

import java.util.List;
import java.util.Map;

public interface AdminAccDashboardService {
    List<Map<String, Object>> getTopTravelRank();

    AdminDashboardDTO.Accommodations getAccommodationStats(String range);
}
