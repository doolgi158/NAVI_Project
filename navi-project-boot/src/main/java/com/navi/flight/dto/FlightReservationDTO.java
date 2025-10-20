package com.navi.flight.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.navi.common.enums.RsvStatus;
import com.navi.flight.domain.FlightReservation;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

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

    private Long seatId; // 예약 좌석 ID (nullable)

    @PositiveOrZero
    private BigDecimal totalPrice; // 결제 금액 (BigDecimal로 수정)

    @NotNull
    private RsvStatus status; // 예약 상태

    @NotBlank
    private String passengersJson; // 탑승자 정보 JSON (CLOB 원문)

    private LocalDate paidAt; // 결제 완료일 (nullable)

    // ✅ Entity → DTO 변환
    public static FlightReservationDTO fromEntity(FlightReservation entity) {
        if (entity == null) return null;

        return FlightReservationDTO.builder()
                .frsvId(entity.getFrsvId())
                .userNo(entity.getUser() != null ? entity.getUser().getNo() : null)
                .flightId(entity.getFlight() != null ? entity.getFlight().getFlightId().getFlightId() : null)
                .depTime(entity.getFlight() != null ? LocalDate.from(entity.getFlight().getFlightId().getDepTime()) : null)
                .seatId(entity.getSeat() != null ? entity.getSeat().getSeatId() : null)
                .totalPrice(entity.getTotalPrice())
                .status(entity.getStatus())
                .passengersJson(entity.getPassengersJson())
                .paidAt(entity.getPaidAt())
                .build();
    }
}
