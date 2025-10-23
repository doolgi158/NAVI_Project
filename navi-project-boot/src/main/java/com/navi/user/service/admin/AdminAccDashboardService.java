package com.navi.user.service.admin;

import java.util.List;
import java.util.Map;

public interface AdminAccDashboardService {
    long getTotalAccommodationCount();

    List<Map<String, Object>> getTopTravelRank();
}
