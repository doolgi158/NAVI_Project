package com.navi.flight.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.navi.common.enums.RsvStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightReservationDTO {

    @NotNull
    private Long userNo;

    @NotBlank
    private String flightId;

    // 예약은 날짜만 받음 (좌석 API는 LocalDateTime 별도)
    @NotNull
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate depTime;

    @NotBlank
    private String passengersJson; // CLOB(JSON) 원문

    @PositiveOrZero
    private int totalPrice;

    @NotNull
    private RsvStatus status; // PENDING, PAID, CANCELLED, REFUNDED, FAILED, COMPLETED
}
