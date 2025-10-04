package com.navi.flight.service;

import com.navi.flight.domain.Airport;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import com.navi.flight.domain.Seat;
import com.navi.flight.domain.SeatClass;
import com.navi.flight.dto.ApiFlightDTO;
import com.navi.flight.dto.FlightDetailResponseDTO;
import com.navi.flight.dto.FlightSearchRequestDTO;
import com.navi.flight.repository.AirportRepository;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService {

    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    private final AirportRepository airportRepository;

    /**
     * API에서 넘어온 공항명 → DB 공항 엔티티 매핑
     * (예: "부산" → "김해(부산)")
     */
    private Airport resolveAirportByApiName(String apiName) {
        // 1) 특수 케이스 처리
        if ("부산".equals(apiName) || "김해".equals(apiName)) {
            return airportRepository.findByAirportName("김해(부산)")
                    .orElseThrow(() -> new RuntimeException("공항 정보 없음: " + apiName));
        }

        // 2) 정확 매칭 → 3) 부분 매칭
        return airportRepository.findByAirportName(apiName)
                .or(() -> airportRepository.findByAirportNameContaining(apiName))
                .orElseThrow(() -> new RuntimeException("공항 정보 없음: " + apiName));
    }

    @Override
    public void saveFlight(ApiFlightDTO dto) {
        Airport depAirport = resolveAirportByApiName(dto.getDepAirportNm());
        Airport arrAirport = resolveAirportByApiName(dto.getArrAirportNm());

        Flight flight = Flight.builder()
                .id(new FlightId(
                        dto.getVihicleId(),
                        LocalDateTime.parse(dto.getDepPlandTime().toString(),
                                DateTimeFormatter.ofPattern("yyyyMMddHHmm"))
                ))
                .airlineNm(dto.getAirlineNm())
                .depAirport(depAirport)
                .arrAirport(arrAirport)
                .arrTime(LocalDateTime.parse(dto.getArrPlandTime().toString(),
                        DateTimeFormatter.ofPattern("yyyyMMddHHmm")))
                .economyCharge(dto.getEconomyCharge())
                .prestigeCharge(dto.getPrestigeCharge())
                .build();

        flightRepository.save(flight);

        // 좌석 자동 생성
        int totalRows = 30;
        int seatsPerRow = 6;
        int totalSeats = totalRows * seatsPerRow;
        int prestigeSeats = (int) Math.round(totalSeats * 0.1);
        int prestigeRows = prestigeSeats / seatsPerRow;

        for (int i = 1; i <= totalRows; i++) {
            for (char col = 'A'; col <= 'F'; col++) {
                SeatClass seatClass =
                        (i <= prestigeRows && flight.getPrestigeCharge() != null && flight.getPrestigeCharge() > 0)
                                ? SeatClass.PRESTIGE
                                : SeatClass.ECONOMY;

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
    public void reserveSeat(Long seatId, String userName) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("좌석 없음"));

        if (seat.isReserved()) {
            throw new RuntimeException("이미 예약된 좌석입니다.");
        }

        seat.setReserved(true);
    }

    @Override
    public List<FlightDetailResponseDTO> searchFlights(FlightSearchRequestDTO requestDTO) {
        return flightRepository.findAll().stream()
                .filter(f -> f.getDepAirport().getAirportCode().equals(requestDTO.getDepAirportCode()))
                .filter(f -> f.getArrAirport().getAirportCode().equals(requestDTO.getArrAirportCode()))
                .filter(f -> f.getId().getDepTime().toLocalDate().equals(
                        LocalDateTime.parse(requestDTO.getDepDate()).toLocalDate()))
                .map(f -> {
                    int price = requestDTO.getSeatClass().equalsIgnoreCase("ECONOMY")
                            ? f.getEconomyCharge()
                            : (f.getPrestigeCharge() != null ? f.getPrestigeCharge() : 0);

                    return FlightDetailResponseDTO.builder()
                            .flightNo(f.getId().getFlightId())
                            .airlineNm(f.getAirlineNm())
                            .depAirportCode(f.getDepAirport().getAirportCode())
                            .depAirportName(f.getDepAirport().getAirportName())
                            .arrAirportCode(f.getArrAirport().getAirportCode())
                            .arrAirportName(f.getArrAirport().getAirportName())
                            .depTime(f.getId().getDepTime())
                            .arrTime(f.getArrTime())
                            .price(price)
                            .seatClass(requestDTO.getSeatClass().toUpperCase())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public long countFlights() {
        return flightRepository.count();
    }

    @Override
    public long countSeats() {
        return seatRepository.count();
    }
}
