package com.navi.flight.service;

import com.navi.common.enums.RsvStatus;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightReservation;
import com.navi.flight.domain.Seat;
import com.navi.flight.dto.FlightReservationDTO;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.repository.FlightReservationRepository;
import com.navi.flight.repository.SeatRepository;
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
    private final SeatRepository seatRepository;

    /* 항공편 예약 생성 */
    @Override
    @Transactional
    public FlightReservationDTO createReservation(FlightReservationDTO dto) {

        // 1. 사용자 검증
        User user = userRepository.findById(dto.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userNo=" + dto.getUserNo()));

        // 2. 항공편 검증
        LocalDateTime startOfDay = dto.getDepTime().atStartOfDay();
        LocalDateTime endOfDay = dto.getDepTime().atTime(23, 59, 59);
        Flight flight = flightRepository.findByFlightIdAndDepTimeRange(dto.getFlightId(), startOfDay, endOfDay)
                .orElseThrow(() -> new IllegalArgumentException("항공편을 찾을 수 없습니다. flightId=" + dto.getFlightId()));

        // 3. 좌석 락 획득
        Seat seat = seatRepository.findByIdForUpdate(dto.getSeatId());
        if (seat == null) throw new IllegalArgumentException("좌석 정보를 찾을 수 없습니다. seatId=" + dto.getSeatId());
        if (seat.isReserved()) throw new IllegalStateException("이미 예약된 좌석입니다.");

        // 4. 좌석 상태 변경 및 저장
        seat.setReserved(true);
        seatRepository.save(seat); // ✅ 락 + 명시적 반영

        // 5. 예약 생성
        String frsvId = generateFrsvId();
        BigDecimal price = dto.getTotalPrice();

        FlightReservation reservation = FlightReservation.builder()
                .frsvId(frsvId)
                .user(user)
                .flight(flight)
                .seat(seat)
                .totalPrice(price)
                .status(dto.getStatus())
                .passengersJson(dto.getPassengersJson())
                .build();

        reservationRepository.save(reservation);

        log.info("[항공편 예약 완료] frsvId={}, seat={}, user={}, flight={}, status={}",
                frsvId, seat.getSeatNo(), user.getName(), dto.getFlightId(), dto.getStatus());

        return FlightReservationDTO.fromEntity(reservation); // ✅ 바로 DTO 반환
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

    /* 예약번호 생성 (고유성 강화 버전) */
    private String generateFrsvId() {
        String date = LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
        return String.format("%sFLY%s", date, String.valueOf(System.nanoTime()).substring(8)); // ✅ 중복 방지
    }

//    @Override
//    public BigDecimal getTotalAmountByReserveId(String frsvId) {
//        FlightReservation reservation = reservationRepository.findByFrsvId(frsvId)
//                .orElseThrow(() -> new IllegalArgumentException("예약 정보를 찾을 수 없습니다. id=" + frsvId));
//        return reservation.getTotalPrice();
//    }
//
//    @Override
//    public BigDecimal getTotalAmountByReserveIds(List<String> reserveIds) {
//        return reserveIds.stream()
//                .map(this::getTotalAmountByReserveId)
//                .reduce(BigDecimal.ZERO, BigDecimal::add);
//    }
}
