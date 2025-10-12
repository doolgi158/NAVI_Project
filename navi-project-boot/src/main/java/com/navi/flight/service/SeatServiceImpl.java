package com.navi.flight.service;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.Seat;
import com.navi.flight.domain.SeatClass;
import com.navi.flight.dto.SeatResponseDTO;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.repository.SeatRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {

    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;

    /*
     * 항공편 좌석 조회 (자동 생성 포함)
     */
    @Override
    @Transactional
    public List<SeatResponseDTO> getSeatsByFlight(String flightId, LocalDateTime depTime) {
        Flight flight = flightRepository.findByFlightIdAndDepTime(flightId, depTime)
                .orElseThrow(() -> new RuntimeException("해당 운항편이 존재하지 않습니다."));

        List<Seat> seats;

        // 좌석 생성 여부 확인
        boolean seatExists = seatRepository.existsByFlightId(flight.getFlightId());
        if (flight.isSeatInitialized() || seatExists) {
            seats = seatRepository.findByFlightAndDepTime(flightId, depTime);
        } else {
            synchronized (this) {
                boolean recheck = seatRepository.existsByFlightId(flight.getFlightId());
                if (!recheck) {
                    createSeatsForFlight(flight);
                }
            }
            seats = seatRepository.findByFlightAndDepTime(flightId, depTime);
        }

        System.out.println("=== [DEBUG] 좌석 조회 완료 === " + flightId + " / " + depTime);
        return convertToDTOList(flight, seats);
    }

    /*
     * Seat → SeatResponseDTO 변환
     */
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

    /*
     * 좌석 자동 생성 로직
     *  - 1~4행: 프레스티지 (2-2)
     *  - 5~10행: 일반 (3-3, +10,000)
     *  - 11~12행: 비상구 (3-3, +20,000)
     *  - 13~30행: 일반 (3-3)
     */
    private void createSeatsForFlight(Flight flight) {
        List<Seat> newSeats = new ArrayList<>();

        generateSeats(newSeats, flight, 1, 4, new char[]{'A', 'B', 'C', 'D'}, SeatClass.PRESTIGE, 0);
        generateSeats(newSeats, flight, 5, 10, new char[]{'A', 'B', 'C', 'D', 'E', 'F'}, SeatClass.ECONOMY, 10_000);
        generateSeats(newSeats, flight, 11, 12, new char[]{'A', 'B', 'C', 'D', 'E', 'F'}, SeatClass.ECONOMY, 20_000);
        generateSeats(newSeats, flight, 13, 30, new char[]{'A', 'B', 'C', 'D', 'E', 'F'}, SeatClass.ECONOMY, 0);

        seatRepository.saveAll(newSeats);

        flight.setSeatInitialized(true);
        flightRepository.save(flight);

        System.out.println("=== [INFO] 좌석 자동 생성 완료 === " + newSeats.size() + "석");
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

    /*
     * 자동 좌석 배정 (예: 랜덤 or 연속 좌석)
     */
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
}
