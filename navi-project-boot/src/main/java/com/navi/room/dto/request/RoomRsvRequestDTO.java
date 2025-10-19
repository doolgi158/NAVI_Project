package com.navi.room.dto.request;

import lombok.*;
import java.time.LocalDate;

/* ============================================================
   [RoomRsvRequestDTO]
   - 객실 예약 생성 요청 DTO
   - 결제 전 임시 예약 생성용
   ============================================================ */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomRsvRequestDTO {

    /* === 예약 기본정보 === */
    private String reserveId;      // 예약 ID (공통 예약번호)
    private Long userNo;           // 사용자 번호 (회원 테이블 user_no)
    private String roomId;         // 객실 ID (ROM001)
    private Long roomStockId;      // 재고 ID (RoomStock.stockNo)
    private LocalDate stockDate;   // 예약 날짜 (1박 단위)
    private Integer quantity;      // 예약 수량
    private Integer price;         // 객실 단가 (결제 전 금액)
}
