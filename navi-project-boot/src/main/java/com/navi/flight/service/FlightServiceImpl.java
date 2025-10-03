package com.navi.flight.service;

import com.navi.flight.domain.Flight;
import com.navi.flight.domain.Seat;
import com.navi.flight.domain.SeatClass;

import com.navi.flight.dto.FlightDetailResponseDTO;
import com.navi.flight.dto.FlightSearchRequestDTO;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.repository.SeatRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

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

    @Override
    public List<FlightDetailResponseDTO> searchFlights(FlightSearchRequestDTO requestDTO) {
        LocalDate depDate = LocalDate.parse(requestDTO.getDepDate(), DateTimeFormatter.ISO_DATE);

        return flightRepository.findAll().stream()
                .filter(f -> f.getDepAirportNm().equals(requestDTO.getDepAirportNm()))
                .filter(f -> f.getArrAirportNm().equals(requestDTO.getArrAirportNm()))
                .filter(f -> f.getId().getDepTime().toLocalDate().equals(depDate))
                .map(f -> {
                    int price = requestDTO.getSeatClass().equalsIgnoreCase("ECONOMY")
                            ? f.getEconomyCharge() : f.getPrestigeCharge() != null ? f.getPrestigeCharge() : 0;

                    return FlightDetailResponseDTO.builder()
                            .flightNo(f.getId().getFlightId())
                            .airlineNm(f.getAirlineNm())
                            .depAirportNm(f.getDepAirportNm())
                            .arrAirportNm(f.getArrAirportNm())
                            .depTime(f.getId().getDepTime())
                            .arrTime(f.getArrTime())
                            .price(price)
                            .seatClass(requestDTO.getSeatClass().toUpperCase())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
