package com.navi.accommodation.dto.response;

import lombok.*;

/**
 * ============================================
 * [AccListResponseDTO]
 * : 숙소 목록 조회 응답 DTO
 * ============================================
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccListResponseDTO {
    private String accId;           // 숙소 ID
    private String title;           // 숙소명
    private String address;         // 숙소 주소

    private Integer minPrice;       // Todo: 예약 가능 객실 중 최저가
    private Integer remainingRooms; // Todo: 예약 가능 잔여 객실 수
}
