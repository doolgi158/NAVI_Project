package com.navi.flight.service;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightReservation;
import com.navi.flight.dto.FlightReservationDTO;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.repository.FlightReservationRepository;
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightReservationServiceImpl implements FlightReservationService {

    private final FlightReservationRepository reservationRepository;
    private final FlightRepository flightRepository;
    private final UserRepository userRepository;

    /* 항공편 예약 생성 */
    @Override
    @Transactional
    public FlightReservation createReservation(FlightReservationDTO dto) {

        // 사용자 검증
        User user = userRepository.findById(dto.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 항공편 검증 (복합키: flightId + depTime)
        LocalDateTime depStart = dto.getDepTime().atStartOfDay();
        LocalDateTime depEnd = dto.getDepTime().plusDays(1).atStartOfDay();

        Flight flight = flightRepository.findByFlightIdAndDepTimeRange(
                dto.getFlightId(),
                depStart,
                depEnd
        ).orElseThrow(() -> new IllegalArgumentException("항공편 정보를 찾을 수 없습니다."));

        // 예약번호 생성 (예: 20251014_FLY_001)
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long countToday = reservationRepository.countByCreatedAtBetween(
                LocalDate.now().atStartOfDay(),
                LocalDate.now().plusDays(1).atStartOfDay()
        );
        String frsvId = String.format("%sFLY%04d", datePrefix, countToday + 1);

        // 예약 엔티티 생성
        FlightReservation reservation = FlightReservation.builder()
                .frsvId(frsvId)
                .user(user)
                .flight(flight)
                .totalPrice(dto.getTotalPrice() != null ? dto.getTotalPrice() : BigDecimal.ZERO)
                .status("PENDING")
                .passengersJson(dto.getPassengersJson())
                .build();

        // 저장
        FlightReservation saved = reservationRepository.save(reservation);

        // 로그 출력
        log.info("[항공편 예약 완료] 예약번호: {}, 사용자: {}, 항공편: {}, 상태: {}",
                saved.getFrsvId(),
                user.getName(),
                flight.getFlightId(),
                saved.getStatus()
        );

        return saved;
    }

    /* 사용자별 예약 조회 */
    @Override
    public List<FlightReservation> getReservationsByUser(Long userNo) {
        return reservationRepository.findByUser_No(userNo);
    }

    /* 상태 변경 (결제 완료 등) */
    @Override
    @Transactional
    public void updateStatus(String frsvId, String status) {
        FlightReservation reservation = reservationRepository.findById(frsvId)
                .orElseThrow(() -> new IllegalArgumentException("예약 정보를 찾을 수 없습니다."));
        reservation.setStatus(status);
        reservationRepository.save(reservation);
        log.info("[항공편 예약 상태 변경] 예약번호: {}, 변경 상태: {}", frsvId, status);
    }
}
