package com.navi.flight.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * FlightReservationDTO
 * - 항공편 예약 데이터 전송용 DTO
 * - DeliveryReservationDTO와 동일 구조로 설계
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightReservationDTO {

    private String frsvId;          // 서버에서 자동 생성 (예: F202510140001)
    private BigDecimal totalPrice;  // 총 결제 금액
    private String status;          // 예약 상태 (PENDING / PAID / CANCELLED / FAILED)
    private LocalDate paidAt;       // 결제 완료 일자

    private Long userNo;            // FK - User
    private String flightId;        // FK - Flight
    private LocalDate depTime;      // FK - Flight 출발 시간 (복합키 중 하나)

    private String passengersJson;  // 탑승자 JSON (프론트에서 보낼 때 JSON.stringify로 전달)
}
