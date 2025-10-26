package com.navi.admin.payment.service;

import com.navi.admin.user.dto.AdminDashboardDTO;

import java.util.List;
import java.util.Map;

public interface AdminPaymentDashboardService {
    List<AdminDashboardDTO.Payments> getMonthlyPaymentTrend(int months);

    List<Map<String, Object>> getPaymentMethodShare();
}
