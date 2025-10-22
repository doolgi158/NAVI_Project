package com.navi.flight.scheduler;

import com.navi.common.enums.RsvStatus;
import com.navi.flight.domain.FlightReservation;
import com.navi.flight.domain.Seat;
import com.navi.flight.repository.FlightReservationRepository;
import com.navi.flight.repository.SeatRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SeatReleaseScheduler {

    private final FlightReservationRepository reservationRepository;
    private final SeatRepository seatRepository;

    /**
     * ✅ 1분마다 실행
     * - 5분 이상 결제 안 된 예약(PENDING) → 자동 해제
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void releaseExpiredSeats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.minusMinutes(5);

        // createdAt 기준 5분 이상된 PENDING 예약 조회
        List<FlightReservation> expiredList = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == RsvStatus.PENDING
                        && r.getCreatedAt() != null
                        && r.getCreatedAt().isBefore(threshold))
                .toList();

        if (expiredList.isEmpty()) return;

        for (FlightReservation r : expiredList) {
            Seat seat = r.getSeat();
            if (seat != null && seat.isReserved()) {
                seat.setReserved(false);
                seatRepository.save(seat);
                log.info("[AUTO-RELEASE] 좌석 {} 자동 해제 완료 (예약 {})", seat.getSeatNo(), r.getFrsvId());
            }

            r.setStatus(RsvStatus.FAILED);
            reservationRepository.save(r);
        }

        log.info("[AUTO-RELEASE] 만료된 좌석 {}건 자동 해제 완료", expiredList.size());
    }
}
