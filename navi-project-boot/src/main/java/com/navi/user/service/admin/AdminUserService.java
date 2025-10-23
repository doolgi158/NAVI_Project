package com.navi.user.service.admin;

import com.navi.user.dto.admin.AdminDashboardDTO;
import com.navi.user.dto.admin.UserTrendDTO;

import java.util.List;

public interface AdminUserService {
    AdminDashboardDTO getUserStatistics(String range);

    List<UserTrendDTO> findUserTrend(String range);
}
