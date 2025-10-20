package com.navi.room.dto.response;

import com.navi.common.enums.RsvStatus;
import com.navi.room.domain.RoomRsv;
import lombok.*;

import java.time.LocalDate;

/* ============================================================
   [RoomRsvResponseDTO]
   - 예약 결과 반환 DTO
   ============================================================ */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomRsvResponseDTO {
    private String roomRsvId;
    private String roomId;
    private LocalDate stockDate;
    private Integer quantity;
    private Integer price;
    private RsvStatus rsvStatus;

    public static RoomRsvResponseDTO fromEntity(RoomRsv entity) {
        return RoomRsvResponseDTO.builder()
                .roomRsvId(entity.getRoomRsvId())
                .roomId(entity.getRoom().getRoomId())
                .stockDate(entity.getStockDate())
                .quantity(entity.getQuantity())
//                .price(entity.getPrice())
                .rsvStatus(entity.getRsvStatus())
                .build();
    }
}