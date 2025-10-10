package com.navi.accommodation.dto.request;

import lombok.*;

/**
 * ============================================
 * [AccRequestDTO]
 * : 관리자 전용 숙소 등록 / 수정 요청 DTO
 * ============================================
 */

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccRequestDTO {
    private String title;           // 숙소명
    private String category;        // 숙소 유형
    private String tel;             // 문의 전화번호
    private String address;         // 전체 주소
    private String overview;        // 숙소 설명
    private String checkInTime;     // 체크인 시간
    private String checkOutTime;    // 체크아웃 시간
    private Boolean hasCooking;     // 취사 가능 여부
    private Boolean hasParking;     // 주차 가능 여부
    private boolean isActive;       // 운영 여부
}
