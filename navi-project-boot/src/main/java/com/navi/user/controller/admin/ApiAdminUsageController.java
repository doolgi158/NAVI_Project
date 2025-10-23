package com.navi.user.controller.admin;

import com.navi.common.enums.RsvStatus;
import com.navi.delivery.repository.DeliveryReservationRepository;
import com.navi.flight.repository.FlightReservationRepository;
import com.navi.user.enums.ActionType;
import com.navi.user.repository.LogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adm")
public class ApiAdminUsageController {
    private final LogRepository logRepository;
    private final FlightReservationRepository flightReservationRepository;
    private final DeliveryReservationRepository deliveryReservationRepository;

    // 여행지 조회수, 숙소 조회수, 항공편 예약량 (최근 6개월)
    @GetMapping("/usageDashboard")
    public Map<String, Object> getUsageDashboard(@RequestParam(defaultValue = "monthly") String range) {
        LocalDate now = LocalDate.now();
        List<Map<String, Object>> result = new ArrayList<>();

        int steps;
        switch (range) {
            case "daily" -> steps = 7;
            case "weekly" -> steps = 8;
            default -> steps = 6;
        }

        for (int i = steps - 1; i >= 0; i--) {
            LocalDate start;
            LocalDate end;
            String label;

            if (range.equals("daily")) {
                start = now.minusDays(i);
                end = start;
                label = start.toString().substring(5);
            } else if (range.equals("weekly")) {
                start = now.minusWeeks(i);
                end = start.plusDays(6);
                label = "W" + start.get(java.time.temporal.WeekFields.ISO.weekOfYear());
            } else {
                YearMonth ym = YearMonth.from(now.minusMonths(i));
                start = ym.atDay(1);
                end = ym.atEndOfMonth();
                label = ym.getMonthValue() + "월";
            }

            long travelViews = logRepository.countByActionTypeAndCreatedAtBetween(
                    ActionType.VIEW_TRAVEL, start.atStartOfDay(), end.atTime(23, 59, 59));
            long accViews = logRepository.countByActionTypeAndCreatedAtBetween(
                    ActionType.VIEW_ACCOMMODATION, start.atStartOfDay(), end.atTime(23, 59, 59));
            long flightResv = flightReservationRepository.countByStatusAndPaidAtBetween(
                    RsvStatus.PAID, start, end);
            long deliveryResv = deliveryReservationRepository.countByStatusAndCreatedAtBetween(
                    RsvStatus.PAID, start.atStartOfDay(), end.atTime(23, 59, 59));

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
