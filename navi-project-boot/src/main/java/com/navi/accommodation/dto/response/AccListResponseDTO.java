package com.navi.accommodation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccListResponseDTO {
    private String accId;
    private String title;
    private String address;

    // 예약 가능 잔여 객실 수
    private Integer remainingRooms;
}
