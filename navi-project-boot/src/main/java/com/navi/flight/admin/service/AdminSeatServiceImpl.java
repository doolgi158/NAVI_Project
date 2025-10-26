package com.navi.flight.admin.service;

import com.navi.flight.admin.dto.AdminSeatDTO;
import com.navi.flight.admin.dto.AdminSeatUpdateRequest;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import com.navi.flight.domain.Seat;
import com.navi.flight.domain.SeatClass;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.repository.SeatRepository;
import com.navi.flight.util.SeatInitializer;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminSeatServiceImpl implements AdminSeatService {

    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    private final SeatInitializer seatInitializer;

    private static final Function<Seat, AdminSeatDTO> MAPPER = s -> {
        var f = s.getFlight();
        return AdminSeatDTO.builder()
                .seatId(s.getSeatId())
                .seatNo(s.getSeatNo())
                .seatClass(s.getSeatClass())
                .reserved(s.isReserved())
                .extraPrice(BigDecimal.valueOf(s.getExtraPrice()))

                // ✅ Flight 정보
                .flightId(f.getFlightId().getFlightId())
                .depTime(f.getFlightId().getDepTime())
                .depAirportNm(f.getDepAirport().getAirportName())
                .arrAirportNm(f.getArrAirport().getAirportName())
                .build();
    };


    @Override
    public Page<AdminSeatDTO> searchAll(String flightId, LocalDateTime depTime,
                                        Boolean reserved, SeatClass seatClass,
                                        String q, Pageable pageable) {
        return seatRepository.searchAdminSeats(flightId, depTime, reserved, seatClass,
                (q == null || q.isBlank()) ? null : q, pageable).map(MAPPER);
    }

    @Override
    public Page<AdminSeatDTO> getSeatsByFlight(String flightId, LocalDateTime depTime, Pageable pageable) {
        return seatRepository.findByFlight(flightId, depTime, pageable).map(MAPPER);
    }

    @Override
    public List<AdminSeatDTO> getSeatsByFlight(String flightId, LocalDateTime depTime) {
        return seatRepository.findByFlightAndDepTime(flightId, depTime).stream().map(MAPPER).toList();
    }

    @Override
    @Transactional
    public AdminSeatDTO patchSeat(Long seatId, AdminSeatUpdateRequest req) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new EntityNotFoundException("Seat not found: " + seatId));

        if (req.getReserved() != null) seat.setReserved(req.getReserved());
        if (req.getSeatClass() != null) seat.setSeatClass(req.getSeatClass());
        if (req.getExtraPrice() != null) seat.setExtraPrice(req.getExtraPrice().intValue());
        return MAPPER.apply(seat);
    }

    @Override
    @Transactional
    public void deleteOne(Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new EntityNotFoundException("좌석을 찾을 수 없습니다: " + seatId));

        if (seat.isReserved()) {
            throw new IllegalStateException("예약된 좌석은 삭제할 수 없습니다.");
        }

        seatRepository.delete(seat);
        log.info("[ADMIN] 좌석 삭제 완료 - seatId={}", seatId);
    }


    /**
     * ✅ 새 좌석 추가 (빈 번호 자동 탐색)
     */
    @Override
    @Transactional
    public AdminSeatDTO addSeat(String flightId, LocalDateTime depTime) {
        FlightId id = new FlightId(flightId, depTime);
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("항공편 없음"));

        List<Seat> existing = seatRepository.findByFlightAndDepTime(flightId, depTime);
        String newSeatNo = findFirstEmptySeat(existing);
        if (newSeatNo == null) throw new IllegalStateException("모든 좌석이 이미 존재합니다.");

        Seat newSeat = Seat.builder()
                .flight(flight)
                .seatNo(newSeatNo)
                .seatClass(SeatClass.ECONOMY)
                .isReserved(false)
                .extraPrice(0)
                .build();

        seatRepository.save(newSeat);
        return MAPPER.apply(newSeat);
    }

    private String findFirstEmptySeat(List<Seat> existing) {
        char[] cols = {'A', 'B', 'C', 'D', 'E', 'F'};
        for (int row = 1; row <= 30; row++) {
            for (char col : cols) {
                String candidate = row + String.valueOf(col);
                boolean exists = existing.stream()
                        .anyMatch(s -> s.getSeatNo().equals(candidate));
                if (!exists) return candidate;
            }
        }
        return null;
    }

    @Override
    @Transactional
    public void resetSeats(String flightId, LocalDateTime depTime) {
        FlightId id = new FlightId(flightId, depTime);
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("항공편을 찾을 수 없습니다."));

        boolean hasReservedSeats = flight.getSeats().stream().anyMatch(Seat::isReserved);
        if (hasReservedSeats) {
            throw new IllegalStateException("예약된 좌석이 있는 항공편은 초기화할 수 없습니다.");
        }

        seatRepository.deleteByFlight(flight);
        seatInitializer.createSeatsForFlight(flight);
        log.info("[ADMIN] 좌석 초기화 완료 - flightId={}", flightId);
    }


    @Override
    @Transactional
    public void deleteSeats(String flightId, LocalDateTime depTime) {
        FlightId id = new FlightId(flightId, depTime);
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("항공편을 찾을 수 없습니다."));

        boolean hasReservedSeats = flight.getSeats().stream().anyMatch(Seat::isReserved);
        if (hasReservedSeats) {
            throw new IllegalStateException("예약된 좌석이 있는 항공편은 전체 삭제가 불가능합니다.");
        }

        seatRepository.deleteByFlight(flight);
        log.info("[ADMIN] 좌석 전체 삭제 완료 - flightId={}", flightId);
    }


    @Override
    public List<AdminSeatDTO> getAllSeats() {
        return seatRepository.findAll().stream().map(MAPPER).toList();
    }

    @Override
    public List<AdminSeatDTO> getSeatsByFlightId(String flightId) {
        return seatRepository.findAll().stream()
                .filter(s -> s.getFlight().getFlightId().getFlightId().equals(flightId))
                .map(MAPPER).toList();
    }
}
