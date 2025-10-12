package com.navi.flight.service;

import com.navi.flight.dto.ApiFlightDTO;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/*
 *  FlightScheduler
 *
 * [역할]
 * - 매일 새벽 항공편 데이터 자동 갱신
 * - DB 용량 최적화를 위해 지난 항공편 자동 삭제
 * - 공공데이터 API를 호출해 최신 항공편을 갱신
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FlightScheduler {

    private final FlightService flightService;
    private final FlightRepository flightRepository;
    private final ApiFlightService apiFlightService; // 공공데이터 API 호출 전용 서비스

    /**
     * 매일 새벽 3시마다 실행
     * cron = "초 분 시 일 월 요일"
     */
    @Scheduled(cron = "0 0 3 * * *", zone = "Asia/Seoul")
    public void updateFlightsNightly() {
        log.info(" [Scheduler] 항공편 데이터 갱신 시작");

        try {
            // 어제 이전 항공편 삭제
            int deleted = deleteOldFlights();

            // API 호출 후 최신 항공편 리스트 가져오기
            List<ApiFlightDTO> flightList = apiFlightService.fetchTodayFlights();
            log.info("📡 [Scheduler] 공공데이터 API 수신 완료 — {}건", flightList.size());

            // 새 항공편 등록
            for (ApiFlightDTO dto : flightList) {
                try {
                    flightService.saveFlight(dto);
                } catch (Exception e) {
                    log.warn("⚠️ [Scheduler] 항공편 저장 실패 — 편명: {}, 사유: {}",
                            dto.getVihicleId(), e.getMessage());
                }
            }

            log.info("[Scheduler] 항공편 갱신 완료 (삭제 {}건, 등록 {}건)", deleted, flightList.size());

        } catch (Exception e) {
            log.error("[Scheduler] 항공편 갱신 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 어제 이전 항공편 삭제
     * - 오늘 이후 데이터만 유지
     */
    private int deleteOldFlights() {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<Flight> oldFlights = flightRepository.findAll().stream()
                .filter(f -> f.getFlightId().getDepTime().isBefore(today))
                .toList();

        int count = oldFlights.size();
        flightRepository.deleteAll(oldFlights);

        log.info("[Scheduler] 과거 항공편 {}건 삭제 완료", count);
        return count;
    }
}
