package com.NAVI_Project.flight.service;

import com.NAVI_Project.flight.entity.Flight;
import com.NAVI_Project.flight.entity.Seat;
import com.NAVI_Project.flight.repository.FlightRepository;
import com.NAVI_Project.flight.repository.SeatRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService{
    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;

    @Override
    @Transactional
    public void saveFlight(Flight flight) {
        //항공편 저장
        flightRepository.save(flight);

        //좌석 자동 생성(30열 x 6좌석)
        for (int i = 1; i <= 30; i++){
            for (char col = 'A'; col <= 'F'; col++){
                Seat seat = Seat.builder()
                        .flight(flight)
                        .seatNo(i + String.valueOf(col))
                        .isReserved(false)
                        .build();
                seatRepository.save(seat);
            }
        }
    }

    @Override
    @Transactional
    public void reserveSeat(Long seatId, String userName) { //예약 완료시 저장로직 추가 예정
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("좌석 없음"));

        if (seat.isReserved()){
            throw new RuntimeException("이미 예약된 좌석입니다.");
        }

        seat.setReserved(true);
    }
}
