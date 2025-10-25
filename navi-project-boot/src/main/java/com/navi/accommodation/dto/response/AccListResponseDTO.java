package com.navi.accommodation.dto.response;

import com.navi.accommodation.domain.Acc;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/* ========[AccListResponseDTO]========
           숙소 목록 조회 응답 DTO
   ====================================*/

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccListResponseDTO {
    private Long accNo;                 // 객실 번호
    private String accId;               // 숙소 ID
    private String title;               // 숙소명
    private String address;             // 숙소 주소
    private String tel;                 // 연락처
    private String category;            // 유형

    private String accImage;            // 대표 숙소 이미지
    private Integer minPrice;           // 예약 가능 객실 중 최저가
    private Integer remainingRooms;     // Todo: 예약 가능 잔여 객실 수

    private BigDecimal mapx;            // 경도
    private BigDecimal mapy;            // 위도

    private Long viewCount;             // 조회수

    /* Entity → DTO 변환 */
    public static AccListResponseDTO fromEntity(Acc acc) {
        return AccListResponseDTO.builder()
                .accNo(acc.getAccNo())           // 객실 번호
                .accId(acc.getAccId())           // 숙소 ID
                .title(acc.getTitle())           // 숙소명
                .address(acc.getAddress())       // 주소
                .tel(acc.getTel())               // 연락처
                .category(acc.getCategory())     // 유형
                .mapx(acc.getMapx())             // 경도
                .mapy(acc.getMapy())             // 위도
                .viewCount(acc.getViewCount())   // 조회수
                .build();
    }
    // Todo: minPrice, remainingRooms, images는 추후 예약 연동 시 계산 예정
}