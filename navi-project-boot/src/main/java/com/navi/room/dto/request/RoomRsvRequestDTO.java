package com.navi.room.dto.request;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/* ============================================================
   [RoomRsvRequestDTO]
   - 객실 타입 단위 예약 생성 요청 DTO
   - 결제 전 임시 예약 생성용 (start~end 범위)
   ============================================================ */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomRsvRequestDTO {

    /* === 예약 기본정보 === */
    private String reserveId;     // 공통 예약 ID (예: RSV20251020-0001)
    private Long userNo;          // 사용자 번호 (회원 테이블 user_no)
    private String roomId;        // 객실 ID (예: ROM001)

    /* === 예약 기간 === */
    private LocalDate startDate;  // 체크인 날짜
    private LocalDate endDate;    // 체크아웃 날짜

    /* === 예약 상세 정보 === */
    private Integer quantity;     // 객실 수량
    private BigDecimal price;     // 총 객실 금액 (숙박일수×단가×수량)
}
