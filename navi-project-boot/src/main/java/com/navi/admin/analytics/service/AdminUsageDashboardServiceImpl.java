package com.navi.admin.analytics.service;

import com.navi.common.enums.RsvStatus;
import com.navi.delivery.repository.DeliveryReservationRepository;
import com.navi.flight.repository.FlightReservationRepository;
import com.navi.user.enums.ActionType;
import com.navi.user.repository.LogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUsageDashboardServiceImpl implements AdminUsageDashboardService {

    private final LogRepository logRepository;
    private final FlightReservationRepository flightReservationRepository;
    private final DeliveryReservationRepository deliveryReservationRepository;

    @Override
    public Map<String, Object> getUsageTrend() {
        LocalDate now = LocalDate.now();
        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now.minusMonths(i));
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();
            String label = ym.getYear() + "-" + String.format("%02d", ym.getMonthValue());

            long travelViews = logRepository.countByActionTypeAndCreatedAtBetween(
                    ActionType.VIEW_TRAVEL, start.atStartOfDay(), end.atTime(23, 59, 59)
            );

            long accViews = logRepository.countByActionTypeAndCreatedAtBetween(
                    ActionType.VIEW_ACCOMMODATION, start.atStartOfDay(), end.atTime(23, 59, 59)
            );

            long flightResv = flightReservationRepository.countByStatusAndPaidAtBetween(
                    RsvStatus.PAID, start, end
            );

            long deliveryResv = deliveryReservationRepository.countByStatusAndCreatedAtBetween(
                    RsvStatus.PAID, start.atStartOfDay(), end.atTime(23, 59, 59)
            );

            result.add(Map.of(
                    "name", label,
                    "travelViews", travelViews,
                    "accViews", accViews,
                    "flightResv", flightResv,
                    "deliveryResv", deliveryResv
            ));
        }

        return Map.of("usageTrend", result);
    }
}
