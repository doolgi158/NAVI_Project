package com.navi.flight.admin.dto;

import com.navi.flight.domain.FlightReservation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFlightReservationDTO {

    private String rsvId;
    private String userName;
    private String flightId;
    private String depAirport;
    private String arrAirport;
    private LocalDateTime depTime;
    private LocalDateTime arrTime;
    private String seatClass;
    private String seatNo;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ✅ 추가 필드
    private Long seatId;           // 좌석 ID (수정 시 필요)
    private BigDecimal totalPrice; // 결제 금액 (수정 시 필요)

    /** ✅ Entity → DTO 변환 */
    public static AdminFlightReservationDTO fromEntity(FlightReservation r) {
        return AdminFlightReservationDTO.builder()
                .rsvId(r.getFrsvId())
                .userName(r.getUser() != null ? r.getUser().getName() : "-")
                .flightId(r.getFlight() != null ? r.getFlight().getFlightId().getFlightId() : "-")
                .depAirport(r.getFlight() != null ? r.getFlight().getDepAirport().getAirportName() : "-")
                .arrAirport(r.getFlight() != null ? r.getFlight().getArrAirport().getAirportName() : "-")
                .depTime(r.getFlight() != null ? r.getFlight().getFlightId().getDepTime() : null)
                .arrTime(r.getFlight() != null ? r.getFlight().getArrTime() : null)
                .seatNo(r.getSeat() != null ? r.getSeat().getSeatNo() : "-")
                .seatClass(r.getSeat() != null && r.getSeat().getSeatClass() != null
                        ? r.getSeat().getSeatClass().name()
                        : "-")
                .status(r.getStatus() != null ? r.getStatus().name() : "-")
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .seatId(r.getSeat() != null ? r.getSeat().getSeatId() : null)   // ✅ 추가
                .totalPrice(r.getTotalPrice())                                 // ✅ 추가
                .build();
    }
}
