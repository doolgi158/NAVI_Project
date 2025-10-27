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
import java.util.ArrayList;
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
     * - DTO의 selectedSeatIds를 사용하여 다중 좌석을 처리하고 락을 걸어 동시성을 제어합니다.
     */
    @Override
    @Transactional
    public FlightReservationDTO createReservation(FlightReservationDTO dto) {

        User user = userRepository.findById(dto.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. userNo=" + dto.getUserNo()));

        // 1. 해당 항공편 조회
        // DTO의 depTime이 LocalDate이므로, 하루 전체 범위로 조회합니다.
        LocalDateTime startOfDay = dto.getDepTime().atStartOfDay();
        LocalDateTime endOfDay = dto.getDepTime().atTime(23, 59, 59);
        Flight flight = flightRepository.findByFlightIdAndDepTimeRange(dto.getFlightId(), startOfDay, endOfDay)
                .orElseThrow(() -> new IllegalArgumentException("항공편을 찾을 수 없습니다. flightId=" + dto.getFlightId()));

        // 2. 좌석 목록 처리 시작
        List<Seat> selectedSeats = new ArrayList<>();

        // 💡 2-A. DTO에 좌석 ID 목록이 있다면 (프론트에서 수동 선택한 경우)
        if (dto.getSelectedSeatIds() != null && !dto.getSelectedSeatIds().isEmpty()) {
            log.info("[MANUAL-SEAT] 좌석 ID 목록({})으로 예약 처리 시작", dto.getSelectedSeatIds().size());

            for (Long seatId : dto.getSelectedSeatIds()) {
                // PESSIMISTIC_WRITE 락을 걸고 좌석 정보를 조회하여 동시성 제어
                Seat seat = seatRepository.findByIdForUpdate(seatId);

                if (seat == null)
                    throw new IllegalArgumentException("좌석 정보를 찾을 수 없습니다. seatId=" + seatId);
                if (seat.isReserved())
                    throw new IllegalStateException("이미 예약된 좌석이 포함되어 있습니다. seatNo=" + seat.getSeatNo());

                seat.setReserved(true);
                selectedSeats.add(seat);
            }
            // 모든 좌석 일괄 저장
            seatRepository.saveAll(selectedSeats);

        } else {
            // 💡 2-B. 좌석 ID 목록이 없을 경우 (자동 배정 처리)
            // 탑승객 수 파악
            int passengerCount = 1;
            try {
                // passengersJson을 파싱하여 실제 탑승객 수를 확인합니다.
                if (dto.getPassengersJson() != null && !dto.getPassengersJson().isEmpty()) {
                    ObjectMapper mapper = new ObjectMapper();
                    List<?> arr = mapper.readValue(dto.getPassengersJson(), new TypeReference<List<?>>() {
                    });
                    passengerCount = arr.size();
                }
            } catch (Exception e) {
                log.warn("⚠️ 탑승객 JSON 파싱 실패, 기본값 1명 사용");
            }

            // 자동 배정 서비스 호출
            selectedSeats = seatService.autoAssignSeats(
                    dto.getFlightId(),
                    flight.getFlightId().getDepTime(), // Flight 엔티티의 정확한 LocalDateTime 사용
                    passengerCount
            );
            log.info("[AUTO-SEAT] 자동배정 완료 — {}명 / 시작좌석={}",
                    passengerCount,
                    selectedSeats.isEmpty() ? "N/A" : selectedSeats.get(0).getSeatNo());
        }
        // 2. 좌석 목록 처리 종료

        // 3. FlightReservation 엔티티 생성 및 저장
        String frsvId = generateFrsvId();
        // DB 제약 상 1:1 관계이므로, 확보된 좌석 중 첫 번째 좌석을 '대표 좌석'으로 연결합니다.
        Seat primarySeat = selectedSeats.isEmpty() ? null : selectedSeats.get(0);

        FlightReservation reservation = FlightReservation.builder()
                .frsvId(frsvId)
                .user(user)
                .flight(flight)
                .seat(primarySeat) // 🚨 대표 좌석만 연결
                .totalPrice(BigDecimal.ZERO)
                .status(RsvStatus.PENDING)
                .passengersJson(dto.getPassengersJson())
                .build();

        reservationRepository.save(reservation);

        log.info("[항공편 예약 완료] frsvId={}, seats={}, user={}, flight={}, status=PENDING",
                frsvId,
                selectedSeats.stream().map(Seat::getSeatNo).collect(Collectors.joining(", ")),
                user.getName(),
                dto.getFlightId());

        return FlightReservationDTO.fromEntity(reservation);
    }

    /*
     * 복수 예약 생성 (왕복 예약 시 한 번에 insert)
     */
    @Override
    @Transactional
    public List<FlightReservationDTO> createBatchReservations(List<FlightReservationDTO> dtos) {
        return dtos.stream()
                .map(this::createReservation) // 수정된 로직 재활용
                .collect(Collectors.toList());
    }

    /*
     * 결제 성공 후 금액 업데이트
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
    public List<FlightReservationDTO> getReservationsByUserDTO(Long userNo) {
        return reservationRepository.findByUser_No(userNo)
                .stream()
                .map(FlightReservationDTO::fromEntity)
                .collect(Collectors.toList());
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
        LocalDate today = LocalDate.now();

        long countToday = reservationRepository.countByCreatedAtBetween(
                today.atStartOfDay(),
                today.plusDays(1).atStartOfDay()
        );

        return String.format("%sFLY%04d",
                today.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE),
                countToday + 1
        );
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

        // partialUpdate에서는 다중 좌석 변경을 처리하지 않고, 단일 좌석 변경만 처리하도록 기존 로직 유지
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
