package com.navi.flight.admin.dto;

import com.navi.flight.domain.SeatClass;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AdminSeatUpdateRequest {

    private Boolean reserved;           // 예약 여부 (null이면 변경 안함)
    private SeatClass seatClass;        // 좌석등급 (null이면 변경 안함)
    private BigDecimal extraPrice;      // 추가요금 (null이면 변경 안함)
}
