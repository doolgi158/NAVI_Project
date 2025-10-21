package com.navi.flight.dto;

import com.navi.flight.domain.SeatClass;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SeatResponseDTO {
    private Long seatId;
    private String seatNo;
    private SeatClass seatClass;
    private boolean isReserved;
    private int basePrice;
    private int extraPrice;
    private int totalPrice;
}
