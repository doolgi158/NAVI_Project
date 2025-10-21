package com.navi.flight.service;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.Seat;
import com.navi.flight.domain.SeatClass;
import com.navi.flight.dto.SeatResponseDTO;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SeatServiceImpl implements SeatService {

    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;

    /** ✅ 좌석 조회 (자동 생성 포함) */
    @Override
    public List<SeatResponseDTO> getSeatsByFlight(String flightId, LocalDateTime depTime) {

        // 1️⃣ 항공편 조회
        Flight flight = flightRepository.findByFlightIdAndDepDate(flightId, depTime)
                .orElseThrow(() -> new RuntimeException(
                        "해당 운항편이 존재하지 않습니다. (flightId=" + flightId + ", depTime=" + depTime + ")"));

        // 2️⃣ 좌석 존재 여부 (count 기반)
        long count = seatRepository.countByFlightIdAndDepTimeRange(
                flightId,
                depTime.minusMinutes(5),
                depTime.plusMinutes(5)
        );
        boolean seatExists = count > 0;

        // 3️⃣ 좌석 미초기화 → 자동 생성
        if (!flight.isSeatInitialized() && !seatExists) {
            log.info("[AUTO-SEAT] 좌석 미초기화 감지 → 자동 생성 시작");
            createSeatsForFlight(flight);
            flight.setSeatInitialized(true);
            flightRepository.saveAndFlush(flight);
        }

        // 4️⃣ 좌석 조회
        List<Seat> seats = seatRepository.findByFlightAndDepTimeRange(
                flightId,
                depTime.minusMinutes(5),
                depTime.plusMinutes(5)
        );

        log.info("[AUTO-SEAT] 좌석 조회 완료 — {}개", seats.size());
        return convertToDTOList(flight, seats);
    }

    /** ✅ 좌석 DTO 변환 */
    private List<SeatResponseDTO> convertToDTOList(Flight flight, List<Seat> seats) {
        return seats.stream()
                .map(seat -> {
                    int basePrice = seat.getSeatClass() == SeatClass.ECONOMY
                            ? flight.getEconomyCharge()
                            : flight.getPrestigeCharge();
                    return SeatResponseDTO.builder()
                            .seatId(seat.getSeatId())
                            .seatNo(seat.getSeatNo())
                            .seatClass(seat.getSeatClass())
                            .isReserved(seat.isReserved())
                            .basePrice(basePrice)
                            .extraPrice(seat.getExtraPrice())
                            .totalPrice(basePrice + seat.getExtraPrice())
                            .build();
                })
                .toList();
    }

    /** ✅ 좌석 자동 생성 규칙 */
    private void createSeatsForFlight(Flight flight) {
        List<Seat> newSeats = new ArrayList<>();
        generateSeats(newSeats, flight, 1, 4, new char[]{'A','B','C','D'}, SeatClass.PRESTIGE, 0);
        generateSeats(newSeats, flight, 5, 10, new char[]{'A','B','C','D','E','F'}, SeatClass.ECONOMY, 10_000);
        generateSeats(newSeats, flight, 11, 12, new char[]{'A','B','C','D','E','F'}, SeatClass.ECONOMY, 20_000);
        generateSeats(newSeats, flight, 13, 30, new char[]{'A','B','C','D','E','F'}, SeatClass.ECONOMY, 0);

        seatRepository.saveAll(newSeats);
        seatRepository.flush(); // 즉시 DB 반영
        log.info("[AUTO-SEAT] 자동 생성 완료 — {}석", newSeats.size());
    }

    private void generateSeats(List<Seat> seats, Flight flight, int startRow, int endRow,
                               char[] cols, SeatClass seatClass, int extraPrice) {
        for (int row = startRow; row <= endRow; row++) {
            for (char c : cols) {
                seats.add(Seat.builder()
                        .flight(flight)
                        .seatNo(row + String.valueOf(c))
                        .seatClass(seatClass)
                        .extraPrice(extraPrice)
                        .isReserved(false)
                        .build());
            }
        }
    }

    /** ✅ 자동 좌석 배정 */
    @Override
    public List<Seat> autoAssignSeats(String flightId, LocalDateTime depTime, int passengerCount) {
        List<Seat> availableSeats = seatRepository.findByFlightAndDepTimeRange(
                        flightId,
                        depTime.minusMinutes(5),
                        depTime.plusMinutes(5)
                ).stream()
                .filter(s -> !s.isReserved())
                .toList();

        if (availableSeats.isEmpty())
            throw new IllegalStateException("예약 가능한 좌석이 없습니다.");

        Collections.shuffle(availableSeats);
        List<Seat> selected = availableSeats.stream()
                .limit(passengerCount)
                .peek(s -> s.setReserved(true))
                .collect(Collectors.toList());

        return seatRepository.saveAll(selected);
    }

    /** ✅ 좌석 초기화 보장 (폴링용) */
    @Override
    public boolean ensureSeatsInitialized(String flightId, LocalDateTime depTime) {
        Optional<Flight> opt = flightRepository.findByFlightIdAndDepDate(flightId, depTime);
        if (opt.isEmpty()) {
            log.warn("[WARN] Flight not found — {} / {}", flightId, depTime);
            return false;
        }

        Flight flight = opt.get();
        if (flight.isSeatInitialized()) return true;

        long count = seatRepository.countByFlightIdAndDepTimeRange(
                flightId, depTime.minusMinutes(5), depTime.plusMinutes(5)
        );
        boolean exists = count > 0;

        if (!exists) {
            createSeatsForFlight(flight);
            flight.setSeatInitialized(true);
            flightRepository.saveAndFlush(flight);
        }

        return true;
    }
}
