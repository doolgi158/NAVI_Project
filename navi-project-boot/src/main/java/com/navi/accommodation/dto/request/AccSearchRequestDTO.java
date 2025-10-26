package com.navi.accommodation.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/* ====[AccSearchRequestDTO]====
      숙소 검색 조건 요청 DTO
   =============================*/

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccSearchRequestDTO {
    private String city;               // 도시명 (예: 제주시)
    private String townshipName;       // 읍면동명 (예: 애월읍)
    private String title;              // 숙소명 (키워드 검색)
    //private String spot;               // 관광지명 (추후 구현 예정)
    private String checkIn;         // 체크인 날짜
    private String checkOut;        // 체크아웃 날짜
    private Integer guestCount;        // 투숙 인원
    private Integer roomCount;         // 필요한 객실 수 (미사용 시 null)
    private List<String> categoryList; // 숙소 유형 필터 (호텔/펜션/게하 등)
    private String sort;               // 정렬 기준 (price/recent/default)
}
