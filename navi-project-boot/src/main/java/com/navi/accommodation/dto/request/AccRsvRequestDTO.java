package com.navi.accommodation.dto.request;

/*
 * ============================
 * [AccRsvDetailRequestDTO]
 * : 숙소 예약 상세 등록 요청 DTO
 * ============================
 */

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccRsvRequestDTO {
    private String reserveId;      // 예약 고유번호 (예: 20251007ACC001)
    private String roomId;         // 객실 ID (예: ROM003)
    private Integer quantity;      // 객실 수 (예: 2)
    private Integer roomPrice;     // 객실 단가 (예: 74000)
    private Integer totalAmount;   // 총 금액 (예: 148000)
    private LocalDate startDate;   // 숙박 시작일 (예: 2025-08-31)
    private LocalDate endDate;     // 숙박 종료일 (예: 2025-09-02)
}
