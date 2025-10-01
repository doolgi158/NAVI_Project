package com.navi.flight.service;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.Seat;
import com.navi.flight.domain.SeatClass;

import com.navi.flight.repository.FlightRepository;
import com.navi.flight.repository.SeatRepository;
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

        int totalRows = 30; // 총 30줄
        int seatsPerRow = 6; // A~F 표출 위해 필요
        int prestigeRows = (int) Math.ceil(totalRows * 0.1); // 전체의 10프로 프레스티지 석 설정

        for (int i = 1; i <= totalRows; i++){
            for (char col = 'A'; col <= 'F'; col++){
                SeatClass seatClass = (i <= prestigeRows && flight.getPrestigeCharge() != null && flight.getPrestigeCharge() > 0)
                    ? SeatClass.PRESTIGE : SeatClass.ECONOMY;

                Seat seat = Seat.builder()
                        .flight(flight)
                        .seatNo(i + String.valueOf(col))
                        .isReserved(false)
                        .seatClass(seatClass)
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
