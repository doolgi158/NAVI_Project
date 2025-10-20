package com.navi.room.dto.response;

import lombok.*;
import java.time.LocalDate;

/* ===============[StockResponseDTO]===============
   클라이언트에 재고 현황을 반환할 때 사용하는 DTO
   =============================================== */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockResponseDTO {
    private Long stockNo;          // 내부 식별번호
    private Long roomNo;           // 객실 번호
    private String roomId;         // 객실 ID
    private String roomName;       // 객실명 (선택사항, UI 편의용)
    private LocalDate stockDate;   // 날짜
    private Integer remainCount;   // 남은 수량
    private Boolean isAvailable;   // 판매 가능 여부
}
