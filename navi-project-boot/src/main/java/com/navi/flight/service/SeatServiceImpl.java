package com.navi.flight.service;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.Seat;
import com.navi.flight.domain.SeatClass;
import com.navi.flight.dto.SeatResponseDTO;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
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

        Flight flight = flightRepository.findByFlightIdAndDepDate(flightId, depTime)
                .orElseThrow(() -> new RuntimeException(
                        "해당 운항편이 존재하지 않습니다. (flightId=" + flightId + ", depTime=" + depTime + ")"));

        long count = seatRepository.countByFlightIdAndDepTimeRange(
                flightId,
                depTime.minusMinutes(5),
                depTime.plusMinutes(5)
        );
        boolean seatExists = count > 0;

        if (!flight.isSeatInitialized() && !seatExists) {
            log.info("[AUTO-SEAT] 좌석 미초기화 감지 → 자동 생성 시작");
            createSeatsForFlight(flight);
            flight.setSeatInitialized(true);
            flightRepository.saveAndFlush(flight);
        }

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
        seatRepository.flush();
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

    /** ✅ 자동 좌석 배정 (여러 명 인접 배치) */
    @Override
    @Transactional
    public List<Seat> autoAssignSeats(String flightId, LocalDateTime depTime, int passengerCount) {
        // 1) 날짜 단위로 항공편 찾기 (00:00 ~ 23:59:59)
        LocalDateTime startOfDay = depTime.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay   = depTime.toLocalDate().atTime(23, 59, 59);

        Flight flight = flightRepository.findByFlightIdAndDepTimeRange(flightId, startOfDay, endOfDay)
                .orElseThrow(() -> new RuntimeException("항공편이 존재하지 않습니다."));

        // 2) 좌석 미초기화 시 생성 보장 (count 기반)
        long count = seatRepository.countByFlightIdAndDepTimeRange(
                flightId, startOfDay, endOfDay
        );
        if (!flight.isSeatInitialized() && count == 0) {
            createSeatsForFlight(flight);
            flight.setSeatInitialized(true);
            flightRepository.saveAndFlush(flight);
        }

        // 3) 해당 날짜 범위 내 좌석 조회 → 예약 가능 좌석만
        List<Seat> availableSeats = seatRepository.findAvailableSeatsForUpdate(
                        flightId, startOfDay, endOfDay
                ).stream()
                .filter(s -> !s.isReserved())
                .sorted(Comparator.comparing(Seat::getSeatNo))
                .toList();

        if (availableSeats.isEmpty()) {
            throw new IllegalStateException("예약 가능한 좌석이 없습니다.");
        }

        // 4) 같은 행(row) 인접 좌석 우선 배정
        Map<String, List<Seat>> byRow = availableSeats.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getSeatNo().replaceAll("[^0-9]", ""), // 숫자만 = 행 번호
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<Seat> assigned = new ArrayList<>();
        for (List<Seat> rowSeats : byRow.values()) {
            // 좌석번호를 알파벳 기준으로 정렬 (A B C D E F ...)
            rowSeats.sort(Comparator.comparing(Seat::getSeatNo));
            if (rowSeats.size() >= passengerCount) {
                assigned = rowSeats.subList(0, passengerCount);
                break;
            }
        }

        // 5) 같은 행에 다 못 앉으면 앞좌석부터 채움
        if (assigned.isEmpty()) {
            assigned = availableSeats.stream().limit(passengerCount).toList();
        }

        // 6) 예약 플래그 업데이트 & 저장
        assigned.forEach(s -> s.setReserved(true));
        seatRepository.saveAll(assigned);

        log.info("[AUTO-SEAT] 자동 배정 완료 — {}명 / 시작좌석={} / 행={}",
                passengerCount,
                assigned.get(0).getSeatNo(),
                assigned.get(0).getSeatNo().replaceAll("[^0-9]", "")
        );

        return assigned;
    }


    @Override
    @Transactional
    public synchronized boolean ensureSeatsInitialized(String flightId, LocalDateTime depTime) {
        // 1️⃣ 항공편 조회 (lock 모드로 안전하게)
        Optional<Flight> opt = flightRepository.findByFlightIdAndDepDate(flightId, depTime);
        if (opt.isEmpty()) {
            log.warn("[WARN] Flight not found — {} / {}", flightId, depTime);
            return false;
        }

        Flight flight = opt.get();

        // 2️⃣ 이미 초기화된 경우 즉시 반환
        if (flight.isSeatInitialized()) {
            log.debug("[SKIP] 이미 초기화된 항공편 — {}", flightId);
            return true;
        }

        // 3️⃣ depTime ±5분 범위 내 좌석 존재 여부 확인
        LocalDateTime start = depTime.minusMinutes(5);
        LocalDateTime end = depTime.plusMinutes(5);
        long count = seatRepository.countByFlightIdAndDepTimeRange(flightId, start, end);
        boolean exists = count > 0;

        // 4️⃣ 좌석이 이미 있다면 초기화 플래그만 true로 세팅
        if (exists) {
            log.info("[INIT] 좌석 이미 존재 — {} ({}개)", flightId, count);
            flight.setSeatInitialized(true);
            flightRepository.saveAndFlush(flight);
            return true;
        }

        // 5️⃣ 좌석 생성 시도
        try {
            log.info("[INIT] 좌석 초기화 시작 — {}", flightId);
            createSeatsForFlight(flight);
            flight.setSeatInitialized(true);
            flightRepository.saveAndFlush(flight);
            log.info("[INIT] 좌석 초기화 완료 — {}", flightId);
        } catch (DataIntegrityViolationException e) {
            // ✅ 동시에 초기화 시도 중이면 예외 무시하고 플래그 true로 처리
            log.warn("[SKIP] 중복 좌석 생성 시도 감지 — {}", flightId);
            flight.setSeatInitialized(true);
            flightRepository.saveAndFlush(flight);
        } catch (Exception e) {
            log.error("[ERROR] 좌석 초기화 중 오류 발생 — {}", flightId, e);
            return false;
        }

        return true;
    }

}
