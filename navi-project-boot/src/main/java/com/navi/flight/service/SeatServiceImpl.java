package com.navi.flight.service;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import com.navi.flight.domain.Seat;
import com.navi.flight.domain.SeatClass;
import com.navi.flight.dto.SeatResponseDTO;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.repository.SeatRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {

    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;

    /**
     * ✅ 항공편 좌석 조회 (자동 생성 포함)
     * - depTime 오차 허용 (±1분)
     */
    @Override
    @Transactional
    public List<SeatResponseDTO> getSeatsByFlight(String flightId, LocalDateTime depTime) {

        // depTime 오차 보정 (1분 범위)
        LocalDateTime start = depTime.minusMinutes(1);
        LocalDateTime end = depTime.plusMinutes(1);

        Flight flight = flightRepository.findByFlightIdAndDepTimeRange(flightId, start, end)
                .orElseThrow(() -> new RuntimeException("해당 운항편이 존재하지 않습니다. (flightId="
                        + flightId + ", depTime=" + depTime + ")"));

        List<Seat> seats;

        // ✅ 좌석 생성 여부 확인
        boolean seatExists = seatRepository.existsByFlightId(flight.getFlightId());
        if (flight.isSeatInitialized() || seatExists) {
            seats = seatRepository.findByFlightAndDepTime(
                    flight.getFlightId().getFlightId(),
                    flight.getFlightId().getDepTime()
            );
        } else {
            synchronized (this) {
                boolean recheck = seatRepository.existsByFlightId(flight.getFlightId());
                if (!recheck) {
                    createSeatsForFlight(flight);
                }
            }
            seats = seatRepository.findByFlightAndDepTime(
                    flight.getFlightId().getFlightId(),
                    flight.getFlightId().getDepTime()
            );
        }

        System.out.println("=== [DEBUG] 좌석 조회 완료 === " + flightId + " / " + depTime);
        return convertToDTOList(flight, seats);
    }

    private List<SeatResponseDTO> convertToDTOList(Flight flight, List<Seat> seats) {
        return seats.stream()
                .map(seat -> {
                    int basePrice = seat.getSeatClass() == SeatClass.ECONOMY
                            ? flight.getEconomyCharge()
                            : flight.getPrestigeCharge();

                    return SeatResponseDTO.builder()
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

    private void createSeatsForFlight(Flight flight) {
        List<Seat> newSeats = new ArrayList<>();

        generateSeats(newSeats, flight, 1, 4, new char[]{'A', 'B', 'C', 'D'}, SeatClass.PRESTIGE, 0);
        generateSeats(newSeats, flight, 5, 10, new char[]{'A', 'B', 'C', 'D', 'E', 'F'}, SeatClass.ECONOMY, 10_000);
        generateSeats(newSeats, flight, 11, 12, new char[]{'A', 'B', 'C', 'D', 'E', 'F'}, SeatClass.ECONOMY, 20_000);
        generateSeats(newSeats, flight, 13, 30, new char[]{'A', 'B', 'C', 'D', 'E', 'F'}, SeatClass.ECONOMY, 0);

        seatRepository.saveAll(newSeats);

        flight.setSeatInitialized(true);
        flightRepository.save(flight);

        log.info("=== [INFO] 좌석 자동 생성 완료 === " + newSeats.size() + "석");
    }

    private void generateSeats(List<Seat> seats, Flight flight, int startRow, int endRow,
                               char[] columns, SeatClass seatClass, int extraPrice) {
        for (int row = startRow; row <= endRow; row++) {
            for (char col : columns) {
                seats.add(Seat.builder()
                        .flight(flight)
                        .seatNo(row + String.valueOf(col))
                        .seatClass(seatClass)
                        .isReserved(false)
                        .extraPrice(extraPrice)
                        .build());
            }
        }
    }

    @Override
    @Transactional
    public List<Seat> autoAssignSeats(String flightId, LocalDateTime depTime, int passengerCount) {
        List<Seat> availableSeats = seatRepository.findAvailableSeatsOrdered(flightId, depTime);
        if (availableSeats.isEmpty()) throw new IllegalStateException("예약 가능한 좌석이 없습니다.");

        Map<Integer, List<Seat>> seatsByRow = availableSeats.stream()
                .collect(Collectors.groupingBy(this::extractRowNumber));

        for (List<Seat> rowSeats : seatsByRow.values()) {
            rowSeats.sort(Comparator.comparing(Seat::getSeatNo));
            List<Seat> consecutive = findConsecutiveSeats(rowSeats, passengerCount);
            if (!consecutive.isEmpty()) {
                consecutive.forEach(s -> s.setReserved(true));
                return seatRepository.saveAll(consecutive);
            }
        }

        Collections.shuffle(availableSeats);
        List<Seat> randomSeats = availableSeats.stream()
                .limit(passengerCount)
                .peek(s -> s.setReserved(true))
                .collect(Collectors.toList());

        return seatRepository.saveAll(randomSeats);
    }

    private List<Seat> findConsecutiveSeats(List<Seat> rowSeats, int count) {
        List<Seat> result = new ArrayList<>();
        for (int i = 0; i < rowSeats.size(); i++) {
            result.clear();
            result.add(rowSeats.get(i));
            for (int j = i + 1; j < rowSeats.size(); j++) {
                if (isAdjacent(rowSeats.get(j - 1), rowSeats.get(j))) {
                    result.add(rowSeats.get(j));
                    if (result.size() == count) return new ArrayList<>(result);
                } else break;
            }
        }
        return Collections.emptyList();
    }

    private boolean isAdjacent(Seat prev, Seat next) {
        String prevCol = prev.getSeatNo().replaceAll("[0-9]", "");
        String nextCol = next.getSeatNo().replaceAll("[0-9]", "");
        return Math.abs(prevCol.charAt(0) - nextCol.charAt(0)) == 1;
    }

    private int extractRowNumber(Seat seat) {
        return Integer.parseInt(seat.getSeatNo().replaceAll("[^0-9]", ""));
    }

    @Override
    public boolean ensureSeatsInitialized(String flightId, LocalDateTime depTime) {
        FlightId id = new FlightId(flightId, depTime);
        Optional<Flight> flightOpt = flightRepository.findById(id);

        if(flightOpt.isEmpty()){
            log.info("[WARN] Flight not found: " + flightId + " / " + depTime);
            return false;
        }
        Flight flight = flightOpt.get();

        //이미 초기화되어 있으면 true 반환
        if(flight.isSeatInitialized()) {
            return true;
        }

        //좌석 존재 여부 확인
        boolean seatExits = seatRepository.existsByFlightId(flight.getFlightId());
        if(!seatExits){
            log.info("[INFO] Lazy 생성 요청 감지 -> 좌석 자동 생성 시작");
            createSeatsForFlight(flight);
            flight.setSeatInitialized(true);
            flightRepository.save(flight);
            log.info("[INFO] Lazy 생성 완료 -> seat_initialized = true");
        }
        return true;
    }

}
