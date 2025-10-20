package com.navi.flight.admin.dto;

import com.navi.flight.domain.SeatClass;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSeatDTO {

    private Long seatId;           // PK
    private String seatNo;         // 좌석번호
    private SeatClass seatClass;   // 좌석등급
    private boolean reserved;      // 예약여부
    private BigDecimal extraPrice; // 추가요금

    // ✅ Flight에서 필요한 정보만 포함
    private String flightId;       // 항공편명
    private LocalDateTime depTime; // 출발시간
    private String depAirportNm;   // 출발지
    private String arrAirportNm;   // 도착지
}
