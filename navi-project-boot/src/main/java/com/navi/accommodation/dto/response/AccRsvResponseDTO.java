package com.navi.accommodation.dto.response;

import com.navi.accommodation.domain.AccRsv;
import lombok.*;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccRsvResponseDTO {
    private Long detailId;         // 상세 ID (PK)
    private String reserveId;      // 예약 ID (예: 20251007ACC001)
    private String roomId;         // 객실 ID (예: ROM003)
    private Integer quantity;      // 객실 수
    private Integer roomPrice;     // 객실 단가
    private Integer totalAmount;   // 총 금액
    private LocalDate startDate;   // 숙박 시작일
    private LocalDate endDate;     // 숙박 종료일

    /* === Entity → DTO 변환 메서드 === */
    public static AccRsvResponseDTO fromEntity(AccRsv entity) {
        return AccRsvResponseDTO.builder()
                .detailId(entity.getDetailId())
                // 추후 고려 사항 : LazyInitializationException 발생 가능 - FetchType.LAZY
                // @Transactional 안에서 처리하거나 Repository 에서 fetch join 이용
                .reserveId(entity.getRsv().getReserveId())
                .roomId(entity.getRoom().getRoomId())
                .quantity(entity.getQuantity())
                .roomPrice(entity.getRoomPrice())
                .totalAmount(entity.getTotalAmount())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .build();
    }

    // 예약 가능 잔여 객실 수
    //Integer remainingRooms;
    // 객실 이미지
    //private List<String> images;
}
