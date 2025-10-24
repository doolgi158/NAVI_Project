package com.navi.admin.payment.service;

import com.navi.admin.user.dto.AdminDashboardDTO;

public interface AdminPaymentDashboardService {
    AdminDashboardDTO.Payments getMonthlyPaymentStats();
}
