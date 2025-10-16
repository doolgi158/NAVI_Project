package com.navi.flight.service;

import com.navi.common.enums.RsvStatus;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
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
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightReservationServiceImpl implements FlightReservationService {

    private final FlightRepository flightRepository;
    private final FlightReservationRepository reservationRepository;
    private final UserRepository userRepository;

    /* 항공편 예약 생성 */
    @Override
    @Transactional
    public FlightReservation createReservation(FlightReservationDTO dto) {

        // 1️.사용자 검증
        User user = userRepository.findById(dto.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userNo=" + dto.getUserNo()));

        // 2.항공편 검증 (복합키)
        // DTO의 depTime은 LocalDate → 하루 전체 범위로 처리
        LocalDateTime startOfDay = dto.getDepTime().atStartOfDay();
        LocalDateTime endOfDay = dto.getDepTime().atTime(23, 59, 59);

        Flight flight = flightRepository.findByFlightIdAndDepTimeRange(dto.getFlightId(), startOfDay, endOfDay)
                .orElseThrow(() -> new IllegalArgumentException("항공편을 찾을 수 없습니다. flightId=" + dto.getFlightId()));

        // 3️.예약 ID 생성
        String frsvId = generateFrsvId();

        // 4.금액 BigDecimal 변환
        BigDecimal price = BigDecimal.valueOf(dto.getTotalPrice());

        // 5.예약 생성
        FlightReservation reservation = FlightReservation.builder()
                .frsvId(frsvId)
                .user(user)
                .flight(flight)
                .totalPrice(price)
                .status(dto.getStatus())
                .passengersJson(dto.getPassengersJson())
                .build();

        reservationRepository.save(reservation);

        log.info("[항공편 예약 완료] frsvId={}, user={}, flight={}, status={}",
                frsvId, user.getName(), dto.getFlightId(), dto.getStatus());

        return reservation;
    }

    /* 사용자별 예약 목록 조회 */
    @Override
    public List<FlightReservation> getReservationsByUser(Long userNo) {
        return reservationRepository.findByUser_No(userNo);
    }

    /* 단일 예약 조회 */
    @Override
    public FlightReservation getReservationById(String frsvId) {
        return reservationRepository.findById(frsvId)
                .orElseThrow(() -> new IllegalArgumentException("예약 정보를 찾을 수 없습니다. frsvId=" + frsvId));
    }

    /* 상태 변경 */
    @Override
    @Transactional
    public FlightReservation updateStatus(String frsvId, String status) {
        FlightReservation reservation = getReservationById(frsvId);
        try {
            RsvStatus newStatus = RsvStatus.valueOf(status.toUpperCase());
            reservation.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("잘못된 상태 값입니다. 허용값: PENDING, PAID, CANCELLED, REFUNDED, FAILED, COMPLETED");
        }
        return reservationRepository.save(reservation);
    }

    /* 예약번호 생성: 20251017FLY0001 */
    private String generateFrsvId() {
        LocalDate today = LocalDate.now();
        long countToday = reservationRepository.count();
        return String.format("%sFLY%04d",
                today.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE),
                countToday + 1);
    }
}
