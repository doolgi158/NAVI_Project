package com.navi.flight.admin.dto;

import com.navi.flight.domain.FlightReservation;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminFlightReservationDTO {
    private String rsvId;
    private String userName;
    private String flightId;
    private String depAirport;
    private String arrAirport;
    private LocalDateTime depTime;
    private String seatNo;
    private String status;
    private LocalDateTime createdAt;

    public static AdminFlightReservationDTO fromEntity(FlightReservation r) {
        return AdminFlightReservationDTO.builder()
                .rsvId(r.getFrsvId()) // ✅ FlightReservation의 PK 필드명은 frsvId
                .userName(r.getUser().getName())
                .flightId(r.getFlight().getFlightId().getFlightId()) // ✅ FlightId.embedded 필드명 flightId
                .depAirport(r.getFlight().getDepAirport().getAirportName()) // ✅ getDepAirport()는 Airport 엔티티
                .arrAirport(r.getFlight().getArrAirport().getAirportName()) // ✅ getArrAirport()도 Airport 엔티티
                .depTime(r.getFlight().getFlightId().getDepTime()) // ✅ FlightId 내부의 depTime
                .seatNo(r.getSeat() != null ? r.getSeat().getSeatNo() : "-")
                .status(r.getStatus().name())
                .createdAt(r.getCreatedAt())
                .build();
    }


}
