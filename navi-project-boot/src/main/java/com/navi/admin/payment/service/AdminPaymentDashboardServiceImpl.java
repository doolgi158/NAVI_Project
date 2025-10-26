package com.navi.admin.payment.service;

import com.navi.admin.payment.repository.AdminPaymentDashboardRepository;
import com.navi.admin.user.dto.AdminDashboardDTO;
import com.navi.admin.util.DashboardUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminPaymentDashboardServiceImpl implements AdminPaymentDashboardService {
    private final AdminPaymentDashboardRepository paymentRepository;


    @Override
    public List<AdminDashboardDTO.Payments> getMonthlyPaymentTrend(int months) {
        List<AdminDashboardDTO.Payments> result = new ArrayList<>();
        YearMonth now = YearMonth.now();

        for (int i = months - 1; i >= 0; i--) {
            YearMonth targetMonth = now.minusMonths(i);
            LocalDateTime start = targetMonth.atDay(1).atStartOfDay();
            LocalDateTime end = targetMonth.atEndOfMonth().atTime(23, 59, 59);

            String monthLabel = targetMonth.toString();

            // 월별 데이터
            long paymentCount = paymentRepository.countPaidPaymentsBetween(start, end);
            long refundCount = paymentRepository.countRefundsBetween(start, end);
            BigDecimal salesAmount = paymentRepository.sumPaidAmountBetween(start, end);
            BigDecimal refundAmount = paymentRepository.sumRefundAmountBetween(start, end);

            // 환불 비율 계산
            double refundRate = paymentCount > 0
                    ? ((double) refundCount / paymentCount) * 100
                    : 0.0;

            result.add(AdminDashboardDTO.Payments.builder()
                    .month(monthLabel)
                    .paymentCount(paymentCount)
                    .refundCount(refundCount)
                    .salesAmount(salesAmount != null ? salesAmount : BigDecimal.ZERO)
                    .refundAmount(refundAmount != null ? refundAmount : BigDecimal.ZERO)
                    .changedPct(Math.round(refundRate * 10) / 10.0)
                    .build());
        }

        // 전월 대비 매출 증감률 계산
        for (int i = 1; i < result.size(); i++) {
            BigDecimal prev = result.get(i - 1).getSalesAmount();
            BigDecimal current = result.get(i).getSalesAmount();

            double changedPct = DashboardUtils.calcPctChange(
                    current != null ? current.doubleValue() : 0.0,
                    prev != null ? prev.doubleValue() : 0.0
            );

            result.get(i).setChangedPct(changedPct);
        }

        return result;
    }

    @Override
    public List<Map<String, Object>> getPaymentMethodShare() {
        List<Object[]> rawData = paymentRepository.countPaymentsByMethod();

        long total = rawData.stream()
                .mapToLong(r -> ((Number) r[1]).longValue())
                .sum();

        Map<String, String> labelMap = Map.of(
                "KGINIPAY", "KG이니시스",
                "KAKAOPAY", "카카오페이",
                "TOSSPAY", "토스페이",
                "ETC", "기타"
        );

        return rawData.stream()
                .map(r -> {
                    String code = r[0] != null ? r[0].toString() : "ETC";
                    String label = labelMap.getOrDefault(code, code);
                    long count = ((Number) r[1]).longValue();
                    double pct = total > 0
                            ? Math.round((count * 1000.0 / total)) / 10.0
                            : 0.0;

                    return Map.<String, Object>of(
                            "method", label,
                            "value", count,
                            "pct", pct
                    );
                })
                .toList();
    }
}
