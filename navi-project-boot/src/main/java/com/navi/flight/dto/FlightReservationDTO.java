package com.navi.flight.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.navi.common.enums.RsvStatus;
import com.navi.flight.domain.Airport;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightReservation;
import com.navi.flight.domain.Seat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightReservationDTO {

    private String frsvId; // 예약 ID (예: F202510140001)

    @NotNull
    private Long userNo; // 유저 번호

    @NotBlank
    private String flightId; // 항공편 ID (예: KE5296)

    @NotNull
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate depTime; // 출발일자
    private LocalDateTime arrTime;  // 도착 일자

    private Long seatId; // 예약 좌석 ID (nullable)
    private String seatNo; // 좌석 번호

    @PositiveOrZero
    private BigDecimal totalPrice; // 결제 금액 (BigDecimal로 수정)

    @NotNull
    private RsvStatus status; // 예약 상태

    @NotBlank
    private String passengersJson; // 탑승자 정보 JSON (CLOB 원문)

    private LocalDate paidAt; // 결제 완료일 (nullable)

    private String depAirport;  // 도착 공항
    private String arrAirport;  // 출발 공항

    private String airline;     // 항공사

    // ✅ Entity → DTO 변환
    public static FlightReservationDTO fromEntity(FlightReservation entity) {
        Flight f = entity.getFlight();
        Seat s = entity.getSeat();

        String depAirportName = null;
        String arrAirportName = null;

        if (f != null) {
            // Lazy 로딩 방지 (proxy 초기화 없이 안전 접근)
            try {
                Airport depAirportEntity = f.getDepAirport();
                Airport arrAirportEntity = f.getArrAirport();

                if (depAirportEntity != null)
                    depAirportName = depAirportEntity.getAirportName();

                if (arrAirportEntity != null)
                    arrAirportName = arrAirportEntity.getAirportName();

            } catch (Exception e) {
                depAirportName = "미확인 출발지";
                arrAirportName = "미확인 도착지";
            }
        }

        return FlightReservationDTO.builder()
                .frsvId(entity.getFrsvId())
                .userNo(entity.getUser() != null ? entity.getUser().getNo() : null)
                .totalPrice(entity.getTotalPrice())
                .status(entity.getStatus())
                .passengersJson(entity.getPassengersJson())
                .paidAt(entity.getPaidAt())
                .seatId(s != null ? s.getSeatId() : null)
                .seatNo(s != null ? s.getSeatNo() : null)
                .flightId(f != null ? f.getFlightId().getFlightId() : null)
                .airline(f.getAirlineNm())
                .arrTime(f.getArrTime())
                .depTime(LocalDate.from(f.getFlightId().getDepTime()))
                .depAirport(depAirportName)
                .arrAirport(arrAirportName)
                .build();
    }
}
