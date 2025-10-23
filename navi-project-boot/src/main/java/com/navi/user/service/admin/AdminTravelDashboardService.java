package com.navi.user.service.admin;

import com.navi.user.dto.admin.AdminDashboardDTO;

import java.util.List;
import java.util.Map;

public interface AdminTravelDashboardService {
    AdminDashboardDTO.Travels getTravelStats(String range);

    List<Map<String, Object>> getTopTravelRank();
}
