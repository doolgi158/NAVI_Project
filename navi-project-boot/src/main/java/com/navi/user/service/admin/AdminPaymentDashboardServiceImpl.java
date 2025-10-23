package com.navi.user.service.admin;

import com.navi.user.dto.admin.AdminDashboardDTO;
import com.navi.user.repository.DashboardPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminPaymentDashboardServiceImpl implements AdminPaymentDashboardService {
    private final DashboardPaymentRepository dashboardPaymentRepository;

    @Override
    public AdminDashboardDTO.Payments getPaymentStats() {
        long count = dashboardPaymentRepository.getMonthlyPaymentCount();
        long lastCount = dashboardPaymentRepository.getLastMonthPaymentCount();
        BigDecimal totalAmount = BigDecimal.valueOf(dashboardPaymentRepository.getTotalPaidAmount());

        double changedPct = 0.0;
        if (lastCount > 0) {
            changedPct = ((double) (count - lastCount) / lastCount) * 100;
        }

        return AdminDashboardDTO.Payments.builder()
                .count(count)
                .amount(totalAmount)
                .changedPct(Math.round(changedPct * 10.0) / 10.0)
                .build();
    }
}
