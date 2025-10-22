package com.navi.flight.admin.service;

import com.navi.common.enums.RsvStatus;
import com.navi.flight.admin.dto.AdminFlightReservationDTO;
import com.navi.flight.domain.FlightReservation;
import com.navi.flight.domain.Seat;
import com.navi.flight.repository.FlightReservationRepository;
import com.navi.flight.repository.SeatRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminFlightReservationServiceImpl implements AdminFlightReservationService {

    private final FlightReservationRepository reservationRepository;
    private final SeatRepository seatRepository;

    /**
     * ✅ 전체 예약 조회 + 필터링
     */
    @Override
    @Transactional(readOnly = true)
    public List<AdminFlightReservationDTO> findReservations(String status, String userName, String startDate, String endDate) {
        List<FlightReservation> reservations = reservationRepository.findAllWithRelations();

        return reservations.stream()
                .filter(r -> status == null || r.getStatus().name().equalsIgnoreCase(status))
                .filter(r -> userName == null || r.getUser().getName().contains(userName))
                .filter(r -> {
                    if (startDate == null && endDate == null) return true;
                    var created = r.getCreatedAt().toLocalDate();
                    var start = startDate != null ? LocalDate.parse(startDate) : LocalDate.MIN;
                    var end = endDate != null ? LocalDate.parse(endDate) : LocalDate.MAX;
                    return !created.isBefore(start) && !created.isAfter(end);
                })
                .map(AdminFlightReservationDTO::fromEntity)
                .toList();
    }

    /**
     * ✅ 단건 조회
     */
    @Override
    @Transactional(readOnly = true)
    public AdminFlightReservationDTO findById(String frsvId) {
        FlightReservation reservation = reservationRepository.findById(frsvId)
                .orElseThrow(() -> new EntityNotFoundException("예약을 찾을 수 없습니다: " + frsvId));
        return AdminFlightReservationDTO.fromEntity(reservation);
    }

    /**
     * ✅ 예약 상태 변경 (취소·실패·대기 시 좌석 복구)
     */
    @Override
    @Transactional
    public void updateStatus(String frsvId, String newStatus) {
        FlightReservation reservation = reservationRepository.findById(frsvId)
                .orElseThrow(() -> new EntityNotFoundException("예약을 찾을 수 없습니다: " + frsvId));

        RsvStatus statusEnum;
        try {
            statusEnum = RsvStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 상태 값입니다: " + newStatus);
        }

        reservation.setStatus(statusEnum);
        reservation.setUpdatedAt(LocalDateTime.now());

        // ✅ 좌석 복구 조건 확장
        if ((statusEnum == RsvStatus.CANCELLED
                || statusEnum == RsvStatus.FAILED
                || statusEnum == RsvStatus.PENDING)
                && reservation.getSeat() != null) {

            Seat seat = reservation.getSeat();
            if (seat.isReserved()) {
                seat.setReserved(false);
                seatRepository.save(seat);
                log.info("🪑 [Admin] 좌석 복구 완료 (상태 변경: {}) seatNo={}", statusEnum.name(), seat.getSeatNo());
            }
        }

        reservationRepository.save(reservation);
        log.info("✅ [Admin] 예약 상태 변경 완료 → {} ({})", frsvId, statusEnum.name());
    }

    /**
     * ✅ 예약 전체 수정 (좌석·상태·금액)
     */
    @Override
    @Transactional
    public void updateReservation(String frsvId, AdminFlightReservationDTO dto) {
        FlightReservation reservation = reservationRepository.findById(frsvId)
                .orElseThrow(() -> new EntityNotFoundException("예약을 찾을 수 없습니다: " + frsvId));

        // ✅ 좌석 지정 또는 변경 처리
        if (dto.getSeatId() != null) {
            if (reservation.getSeat() != null &&
                    !dto.getSeatId().equals(reservation.getSeat().getSeatId())) {

                Seat oldSeat = reservation.getSeat();
                oldSeat.setReserved(false);
                seatRepository.save(oldSeat);

                Seat newSeat = seatRepository.findById(dto.getSeatId())
                        .orElseThrow(() -> new EntityNotFoundException("좌석을 찾을 수 없습니다."));
                if (newSeat.isReserved()) {
                    throw new IllegalStateException("이미 예약된 좌석입니다: " + newSeat.getSeatNo());
                }

                newSeat.setReserved(true);
                seatRepository.save(newSeat);
                reservation.setSeat(newSeat);
                log.info("✏️ [Admin] 좌석 변경 완료: {} → {}", oldSeat.getSeatNo(), newSeat.getSeatNo());
            } else if (reservation.getSeat() == null) {
                Seat newSeat = seatRepository.findById(dto.getSeatId())
                        .orElseThrow(() -> new EntityNotFoundException("좌석을 찾을 수 없습니다."));
                if (newSeat.isReserved()) {
                    throw new IllegalStateException("이미 예약된 좌석입니다: " + newSeat.getSeatNo());
                }

                newSeat.setReserved(true);
                seatRepository.save(newSeat);
                reservation.setSeat(newSeat);
                log.info("✈️ [Admin] 좌석 지정 완료: {}", newSeat.getSeatNo());
            }
        }

        // ✅ 상태 변경
        if (dto.getStatus() != null) {
            try {
                RsvStatus statusEnum = RsvStatus.valueOf(dto.getStatus().toUpperCase());
                reservation.setStatus(statusEnum);

                // 상태 변경에 따라 좌석 복구 추가 확인
                if ((statusEnum == RsvStatus.CANCELLED
                        || statusEnum == RsvStatus.FAILED
                        || statusEnum == RsvStatus.PENDING)
                        && reservation.getSeat() != null) {
                    Seat seat = reservation.getSeat();
                    if (seat.isReserved()) {
                        seat.setReserved(false);
                        seatRepository.save(seat);
                        log.info("🪑 [Admin] 좌석 복구 완료 (예약 수정 중 상태 변경) seatNo={}", seat.getSeatNo());
                    }
                }

            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("유효하지 않은 상태 값입니다: " + dto.getStatus());
            }
        }

        // ✅ 금액 변경
        if (dto.getTotalPrice() != null) {
            reservation.setTotalPrice(dto.getTotalPrice());
        }

        reservation.setUpdatedAt(LocalDateTime.now());
        reservationRepository.save(reservation);

        log.info("✅ [Admin] 예약 수정 완료 → {}", frsvId);
    }

    /**
     * ✅ 예약 삭제 (결제완료 금지 + 좌석 복구)
     */
    @Override
    @Transactional
    public void deleteReservation(String frsvId) {
        FlightReservation reservation = reservationRepository.findById(frsvId)
                .orElseThrow(() -> new EntityNotFoundException("예약을 찾을 수 없습니다: " + frsvId));

        RsvStatus status = reservation.getStatus();

        if (status == RsvStatus.PAID) {
            throw new IllegalStateException("결제 완료된 예약은 삭제할 수 없습니다.");
        }

        // ✅ 좌석 복구
        Seat seat = reservation.getSeat();
        if (seat != null && seat.isReserved()) {
            seat.setReserved(false);
            seatRepository.save(seat);
            log.info("🪑 [Admin] 좌석 복구 완료 (예약 삭제) seatNo={}", seat.getSeatNo());
        }

        reservationRepository.delete(reservation);
        log.info("🗑️ [Admin] 예약 삭제 완료 → {}", frsvId);
    }
}
