package com.navi.accommodation.dto.request;

import com.navi.common.enums.RsvStatus;
import lombok.*;
import java.time.LocalDate;

/* ==========[AccRsvDetailRequestDTO]==========
               숙소 예약 등록 요청 DTO
     예: 해당 정보로 숙소 예약 테이블에 INSERT 수행
  ============================================= */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccRsvRequestDTO {
    @NonNull private String userId;         // 사용자 계정 ID (예: user1)
    @NonNull private String roomId;         // 객실 ID (예: ROM003)
    @NonNull private Integer quantity;      // 객실 수 (예: 2)
    @NonNull private Integer roomPrice;     // 객실 단가 (예: 74000)
    @NonNull private LocalDate startDate;   // 숙박 시작일 (예: 2025-08-31)
    @NonNull private LocalDate endDate;     // 숙박 종료일 (예: 2025-09-02)
    private RsvStatus rsvStatus;   // 예약 상태 (예: PENDING)
}
