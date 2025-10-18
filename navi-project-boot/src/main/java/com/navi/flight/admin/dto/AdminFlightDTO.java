package com.navi.flight.admin.dto;

import com.navi.flight.domain.Flight;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFlightDTO {

    private String flightId;           // 항공편명 (예: 7C4770)
    private String airlineNm;          // 항공사명
    private String depAirportNm;       // 출발 공항명
    private String arrAirportNm;       // 도착 공항명
    private LocalDateTime depTime;     // 출발 시각
    private LocalDateTime arrTime;     // 도착 시각
    private int economyCharge;         // 일반석 요금
    private Integer prestigeCharge;    // 비즈니스 요금
    private boolean seatInitialized;   // 좌석 초기화 여부
    private LocalDateTime createdAt;   // 등록일
    private LocalDateTime updatedAt;   // 수정일

    public static AdminFlightDTO fromEntity(Flight flight) {
        return AdminFlightDTO.builder()
                .flightId(flight.getFlightId().getFlightId())
                .airlineNm(flight.getAirlineNm())
                .depAirportNm(flight.getDepAirport().getAirportName())
                .arrAirportNm(flight.getArrAirport().getAirportName())
                .depTime(flight.getFlightId().getDepTime())
                .arrTime(flight.getArrTime())
                .economyCharge(flight.getEconomyCharge())
                .prestigeCharge(flight.getPrestigeCharge())
                .seatInitialized(flight.isSeatInitialized())
                .createdAt(flight.getCreatedAt())   // BaseEntity에서 가져옴
                .updatedAt(flight.getUpdatedAt())
                .build();
    }
}
