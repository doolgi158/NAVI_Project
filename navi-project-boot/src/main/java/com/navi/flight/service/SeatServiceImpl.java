package com.navi.flight.service;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.Seat;
import com.navi.flight.domain.SeatClass;
import com.navi.flight.dto.SeatStatusDTO;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.repository.SeatRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {

    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;

    @Override
    @Transactional
    public void createSeatsIfNotExists(Flight flight) {
        // 1) 이미 생성되었으면 패스
        if (flight.isSeatInitialized()) return;

        // 2) 방어 로직: 좌석 존재하면 플래그만 true
        if (seatRepository.existsByFlightId(flight.getId())) {
            flight.setSeatInitialized(true);
            return;
        }

        // 3) 좌석 생성 (30열 × A~F, 1~3열은 프레스티지)
        for (int row = 1; row <= 30; row++) {
            for (char col = 'A'; col <= 'F'; col++) {
                SeatClass seatClass = (row <= 3 && flight.getPrestigeCharge() != null && flight.getPrestigeCharge() > 0)
                        ? SeatClass.PRESTIGE : SeatClass.ECONOMY;

                Seat seat = Seat.builder()
                        .flight(flight)
                        .seatNo(row + String.valueOf(col))
                        .isReserved(false)
                        .seatClass(seatClass)
                        .build();

                seatRepository.save(seat);
            }
        }

        // 4) 플래그 on
        flight.setSeatInitialized(true);
        flightRepository.save(flight);
    }

    @Override
    public List<SeatStatusDTO> getSeatStatusByFlight() {
        return seatRepository.findSeatStatusByFlight();
    }

    @Override
    public SeatStatusDTO getSeatStatusByFlightId(String flightId) {
        return seatRepository.findSeatStatusByFlight().stream()
                .filter(dto -> dto.getFlightId().equalsIgnoreCase(flightId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("해당 항공편이 존재하지 않습니다: " + flightId));
    }
}
