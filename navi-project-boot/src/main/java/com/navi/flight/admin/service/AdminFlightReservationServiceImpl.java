package com.navi.flight.admin.service;

import com.navi.common.enums.RsvStatus;
import com.navi.flight.domain.FlightReservation;
import com.navi.flight.admin.dto.AdminFlightReservationDTO;
import com.navi.flight.repository.FlightReservationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminFlightReservationServiceImpl implements AdminFlightReservationService {

    private final FlightReservationRepository reservationRepository;

    /**
     * ✅ 전체 예약 조회 + 필터링
     */
    @Override
    public List<AdminFlightReservationDTO> findReservations(String status, String userName, String startDate, String endDate) {
        List<FlightReservation> reservations = reservationRepository.findAll();

        return reservations.stream()
                .filter(r -> status == null || r.getStatus().name().equalsIgnoreCase(status))
                .filter(r -> userName == null || r.getUser().getName().contains(userName))
                .filter(r -> {
                    if (startDate == null && endDate == null) return true;
                    LocalDate created = r.getCreatedAt().toLocalDate();
                    LocalDate start = startDate != null ? LocalDate.parse(startDate, DateTimeFormatter.ISO_DATE) : LocalDate.MIN;
                    LocalDate end = endDate != null ? LocalDate.parse(endDate, DateTimeFormatter.ISO_DATE) : LocalDate.MAX;
                    return (created.isEqual(start) || created.isAfter(start)) &&
                            (created.isEqual(end) || created.isBefore(end));
                })
                .map(AdminFlightReservationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * ✅ 단건 조회
     */
    @Override
    public AdminFlightReservationDTO findById(String frsvId) {
        FlightReservation reservation = reservationRepository.findById(frsvId)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다: " + frsvId));
        return AdminFlightReservationDTO.fromEntity(reservation);
    }

    /**
     * ✅ 상태 변경
     */
    @Override
    public void updateStatus(String frsvId, String newStatus) {
        FlightReservation reservation = reservationRepository.findById(frsvId)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다: " + frsvId));

        RsvStatus statusEnum;
        try {
            statusEnum = RsvStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 상태 값입니다: " + newStatus);
        }

        reservation.setStatus(statusEnum);
        log.info("[Admin] 예약 상태 변경: {} → {}", frsvId, statusEnum.name());
    }

    /**
     * ✅ 예약 삭제
     */
    @Override
    public void deleteReservation(String frsvId) {
        if (!reservationRepository.existsById(frsvId)) {
            throw new IllegalArgumentException("예약을 찾을 수 없습니다: " + frsvId);
        }
        reservationRepository.deleteById(frsvId);
        log.info("[Admin] 예약 삭제 완료: {}", frsvId);
    }
}
