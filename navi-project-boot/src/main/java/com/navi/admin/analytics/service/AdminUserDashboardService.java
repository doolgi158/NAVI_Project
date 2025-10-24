package com.navi.admin.analytics.service;

import com.navi.admin.user.dto.AdminDashboardDTO;
import com.navi.admin.user.dto.UserTrendDTO;

import java.util.List;

public interface AdminUserDashboardService {
    AdminDashboardDTO getUserStatistics(String range);

    List<UserTrendDTO> findUserTrend(String range);
}
