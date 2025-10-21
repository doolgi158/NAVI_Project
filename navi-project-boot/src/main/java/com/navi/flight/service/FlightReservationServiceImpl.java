package com.navi.flight.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightReservationServiceImpl implements FlightReservationService {

    private final FlightRepository flightRepository;
    private final FlightReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final SeatRepository seatRepository;
    private final SeatService seatService;

    /**
     * ✅ 항공편 예약 생성 (0원 / 결제 전)
     */
    @Override
    @Transactional
    public FlightReservationDTO createReservation(FlightReservationDTO dto) {

        User user = userRepository.findById(dto.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userNo=" + dto.getUserNo()));

        LocalDateTime startOfDay = dto.getDepTime().atStartOfDay();
        LocalDateTime endOfDay = dto.getDepTime().atTime(23, 59, 59);
        Flight flight = flightRepository.findByFlightIdAndDepTimeRange(dto.getFlightId(), startOfDay, endOfDay)
                .orElseThrow(() -> new IllegalArgumentException("항공편을 찾을 수 없습니다. flightId=" + dto.getFlightId()));

        Seat seat;
        if (dto.getSeatId() == null) {
            log.info("[AUTO-SEAT] seatId=null → 자동 배정 시도");
            int passengerCount = 1;
            try {
                if (dto.getPassengersJson() != null && !dto.getPassengersJson().isEmpty()) {
                    ObjectMapper mapper = new ObjectMapper();
                    List<?> arr = mapper.readValue(dto.getPassengersJson(), new TypeReference<List<?>>() {
                    });
                    passengerCount = arr.size();
                }
            } catch (Exception e) {
                log.warn("⚠️ 탑승객 JSON 파싱 실패, 기본값 1명 사용");
            }
            List<Seat> assignedSeats = seatService.autoAssignSeats(
                    dto.getFlightId(),
                    dto.getDepTime().atStartOfDay(),
                    passengerCount
            );
            seat = assignedSeats.get(0);
            log.info("[AUTO-SEAT] 자동배정 완료 — {}명 / 시작좌석={}", passengerCount, seat.getSeatNo());
        } else {
            seat = seatRepository.findByIdForUpdate(dto.getSeatId());
            if (seat == null) throw new IllegalArgumentException("좌석 정보를 찾을 수 없습니다. seatId=" + dto.getSeatId());
            if (seat.isReserved()) throw new IllegalStateException("이미 예약된 좌석입니다.");
            seat.setReserved(true);
            seatRepository.save(seat);
        }

        String frsvId = generateFrsvId();

        FlightReservation reservation = FlightReservation.builder()
                .frsvId(frsvId)
                .user(user)
                .flight(flight)
                .seat(seat)
                .totalPrice(BigDecimal.ZERO)
                .status(RsvStatus.PENDING)
                .passengersJson(dto.getPassengersJson())
                .build();

        reservationRepository.save(reservation);

        log.info("[항공편 예약 완료] frsvId={}, seat={}, user={}, flight={}, status=PENDING",
                frsvId, seat.getSeatNo(), user.getName(), dto.getFlightId());

        return FlightReservationDTO.fromEntity(reservation);
    }

    /*
     *  복수 예약 생성 (왕복 예약 시 한 번에 insert)
     */
    @Override
    @Transactional
    public List<FlightReservationDTO> createBatchReservations(List<FlightReservationDTO> dtos) {
        return dtos.stream()
                .map(this::createReservation) // 기존 로직 재활용
                .collect(Collectors.toList());
    }

    /*
     *  결제 성공 후 금액 업데이트
     */
    @Override
    @Transactional
    public FlightReservation updatePayment(String frsvId, BigDecimal amount) {
        FlightReservation reservation = reservationRepository.findById(frsvId)
                .orElseThrow(() -> new IllegalArgumentException("예약 정보를 찾을 수 없습니다. frsvId=" + frsvId));

        reservation.setTotalPrice(amount);
        reservation.setStatus(RsvStatus.PAID);
        reservation.setPaidAt(LocalDate.from(LocalDateTime.now()));

        log.info("[결제 완료 반영] frsvId={}, amount={}, status=PAID", frsvId, amount);
        return reservationRepository.save(reservation);
    }

    @Override
    public FlightReservation getReservationById(String frsvId) {
        return reservationRepository.findById(frsvId)
                .orElseThrow(() -> new IllegalArgumentException("예약 정보를 찾을 수 없습니다. frsvId=" + frsvId));
    }

    @Override
    public List<FlightReservation> getReservationsByUser(Long userNo) {
        return reservationRepository.findByUser_No(userNo);
    }

    @Override
    @Transactional
    public FlightReservation updateStatus(String frsvId, String status) {
        FlightReservation reservation = getReservationById(frsvId);
        RsvStatus newStatus = RsvStatus.valueOf(status.toUpperCase());
        reservation.setStatus(newStatus);
        return reservationRepository.save(reservation);
    }

    private String generateFrsvId() {
        String date = LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
        return String.format("%sFLY%s", date, String.valueOf(System.nanoTime()).substring(8));
    }

    @Override
    public BigDecimal getTotalAmountByReserveId(String frsvId) {
        FlightReservation reservation = reservationRepository.findByFrsvId(frsvId)
                .orElseThrow(() -> new IllegalArgumentException("예약 정보를 찾을 수 없습니다. id=" + frsvId));
        return reservation.getTotalPrice();
    }

    @Override
    public BigDecimal getTotalAmountByReserveIds(List<String> reserveIds) {
        return reserveIds.stream()
                .map(this::getTotalAmountByReserveId)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional
    public FlightReservation partialUpdate(String frsvId, FlightReservationDTO dto) {
        FlightReservation entity = getReservationById(frsvId);

        if (dto.getSeatId() != null) {
            Seat seat = seatRepository.findByIdForUpdate(dto.getSeatId());
            if (seat == null)
                throw new IllegalArgumentException("좌석 정보를 찾을 수 없습니다. seatId=" + dto.getSeatId());
            if (seat.isReserved())
                throw new IllegalStateException("이미 예약된 좌석입니다.");
            seat.setReserved(true);
            seatRepository.save(seat);
            entity.setSeat(seat);
        }

        if (dto.getTotalPrice() != null)
            entity.setTotalPrice(dto.getTotalPrice());

        if (dto.getStatus() != null)
            entity.setStatus(dto.getStatus());

        if (dto.getPaidAt() != null)
            entity.setPaidAt(dto.getPaidAt());

        return reservationRepository.save(entity);
    }

}
