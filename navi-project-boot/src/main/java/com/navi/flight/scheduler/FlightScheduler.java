package com.navi.flight.scheduler;

import com.navi.flight.domain.Flight;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.service.ApiFlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FlightScheduler {

    private final FlightRepository flightRepository;
    private final ApiFlightService apiFlightService;

    @Scheduled(cron = "0 0 1 * * *", zone = "Asia/Seoul")
    public void updateFlightsNightly() {
        log.info("[FlightScheduler] 항공편 갱신 시작");

        LocalDateTime today = LocalDateTime.now()
                .withHour(0).withMinute(0).withSecond(0).withNano(0);

        // 예약 없는 과거 항공편 삭제
        List<Flight> oldFlights = flightRepository.findAll().stream()
                .filter(f -> f.getFlightId().getDepTime().isBefore(today))
                .filter(f -> f.getReservations().isEmpty())
                .toList();

        if (!oldFlights.isEmpty()) {
            flightRepository.deleteAll(oldFlights);
            log.info("[FlightScheduler] 삭제 완료: {}건", oldFlights.size());
        }

        // 오늘부터 30일치 항공편 생성 (중복 방지)
        apiFlightService.initFlightsNext30Days();
        log.info("[FlightScheduler] 오늘부터 30일치 항공편 등록 완료");
    }
}
