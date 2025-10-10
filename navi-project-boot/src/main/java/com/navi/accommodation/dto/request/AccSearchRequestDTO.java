package com.navi.accommodation.dto.request;

import lombok.*;

import java.time.LocalDate;

/**
 * ========================
 * [AccSearchRequestDTO]
 * : 숙소 검색 조건 요청 DTO
 * ========================
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccSearchRequestDTO {
    private String townshipName;    // 지역명
    private LocalDate checkIn;      // 체크인 날짜
    private LocalDate checkOut;     // 체크아웃 날짜
    private Integer guestCount;     // 투숙 인원
    private Integer roomCount;      // 필요한 객실 수
}
