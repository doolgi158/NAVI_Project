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
    private String accId;               // 숙소 ID
    private String title;               // 숙소명
    private String address;             // 숙소 주소

    private String mainImage;           // Todo: 대표 숙소 이미지
    private BigDecimal minPrice;        // Todo: 예약 가능 객실 중 최저가
    private Integer remainingRooms;     // Todo: 예약 가능 잔여 객실 수

    private BigDecimal mapx;            // 경도
    private BigDecimal mapy;            // 위도

    /* Entity → DTO 변환 */
    public static AccListResponseDTO fromEntity(Acc acc, BigDecimal minPrice) {
        return AccListResponseDTO.builder()
                .accId(acc.getAccId())           // 숙소 ID
                .title(acc.getTitle())           // 숙소명
                .address(acc.getAddress())       // 주소
                .mainImage(acc.getMainImage())   // 대표 이미지
                .minPrice(minPrice)              // 최저가 객실 가격
                .mapx(acc.getMapx())             //경도
                .mapy(acc.getMapy())             //위도
                .build();
    }
}