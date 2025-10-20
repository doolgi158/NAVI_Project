package com.navi.room.dto.request;

import lombok.*;
import java.time.LocalDate;

/* ===============[StockRequestDTO]===============
   재고 정보 생성 및 수정 시 사용하는 요청 DTO
   (예: 관리자 페이지에서 재고 수동 수정)
   ============================================== */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockRequestDTO {
    private String roomId;         // 객실 ID (예: ROM001)
    private LocalDate stockDate;   // 재고 일자 (예: 2025-10-15)
    private Integer remainCount;   // 남은 수량 (null일 경우 roomCnt 기본값)
    private Boolean isAvailable;   // 판매 가능 여부
}
