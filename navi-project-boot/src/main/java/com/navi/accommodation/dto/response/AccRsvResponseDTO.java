package com.navi.accommodation.dto.response;

import com.navi.accommodation.domain.AccRsv;
import com.navi.common.enums.RsvStatus;
import lombok.*;
import java.time.LocalDate;

/* =======[AccRsvResponseDTO]=======
        예약 확정 정보 반환 DTO
       예: 마이페이지/상세 조회용
   =============================== */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccRsvResponseDTO {
    private String arsvId;         // 예약 ID (예: 20250911ACC001)
    private String roomId;         // 객실 ID (예: ROM003)
    private Integer quantity;      // 객실 수 (예: 2)
    private Integer roomPrice;     // 객실 단가 (예: 74000)
    private LocalDate startDate;   // 숙박 시작일 (예: 2025-08-31)
    private LocalDate endDate;     // 숙박 종료일 (예: 2025-09-02)
    private RsvStatus rsvStatus;   // 예약 상태 (예: PAID, CANCELLED, ...)

    /* === Entity → DTO 변환 메서드 === */
    public static AccRsvResponseDTO fromEntity(AccRsv entity) {
        return AccRsvResponseDTO.builder()
                .arsvId(entity.getArsvId())
                .roomId(entity.getRoom().getRoomId())   // LazyInitializationException 주의
                .quantity(entity.getQuantity())
                .roomPrice(entity.getRoomPrice())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .rsvStatus(entity.getRsvStatus())
                .build();
    }
}
