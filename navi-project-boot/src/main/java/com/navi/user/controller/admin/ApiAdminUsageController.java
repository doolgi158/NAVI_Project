package com.navi.user.controller.admin;

import com.navi.flight.repository.FlightReservationRepository;
import com.navi.user.enums.ActionType;
import com.navi.user.repository.LogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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

    // 여행지 조회수, 숙소 조회수, 항공편 예약량 (최근 6개월)
    @GetMapping("/usageDashboard")
    public Map<String, Object> getUsageDashboard() {
        LocalDate now = LocalDate.now();
        YearMonth startMonth = YearMonth.from(now.minusMonths(5)); // 최근 6개월

        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 0; i < 6; i++) {
            YearMonth ym = startMonth.plusMonths(i);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();

            long travelViews = logRepository.countByActionTypeAndCreatedAtBetween(
                    ActionType.VIEW_TRAVEL, start.atStartOfDay(), end.atTime(23, 59, 59));
            long accViews = logRepository.countByActionTypeAndCreatedAtBetween(
                    ActionType.VIEW_ACCOMMODATION, start.atStartOfDay(), end.atTime(23, 59, 59));
            long flightResv = flightReservationRepository.countByStatusAndPaidAtBetween(
                    com.navi.common.enums.RsvStatus.PAID, start, end);

            result.add(Map.of(
                    "name", ym.getMonthValue() + "월",
                    "travelViews", travelViews,
                    "accViews", accViews,
                    "flightResv", flightResv
            ));
        }

        return Map.of("usageTrend", result);
    }
}
