package com.navi.accommodation.dto.response;

import lombok.*;

import java.util.List;

/**
 * =======================
 * [AccDetailResponseDTO]
 * : 숙소 상세 조회 응답 DTO
 * =======================
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccDetailResponseDTO {
    /** 숙소 기본 정보 */
    private String accId;                   // 숙소 ID
    private String category;                // 숙소 유형
    private String tel;                     // 문의 전화번호
    private String address;                 // 전체 주소
    private String overview;                // 숙소 설명
    private String checkInTime;             // 체크인 시간
    private String checkOutTime;            // 체크아웃 시간
    private Boolean hasCooking;             // 취사 가능 여부
    private Boolean hasParking;             // 주차 가능 여부
    private boolean isActive;               // 운영 여부
    private List<String> accImages;         // Todo: 숙소 이미지

    /** 객실 정보 */
    private List<RoomResponseDTO> rooms;    // 객실 리스트 (Todo: 객실별 이미지 포함)
}