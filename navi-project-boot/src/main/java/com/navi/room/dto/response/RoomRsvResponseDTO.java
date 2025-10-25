package com.navi.room.dto.response;

import com.navi.common.enums.RsvStatus;
import com.navi.room.domain.RoomRsv;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
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
    private String reserveId;     // 예약 ID
    private String roomId;        // 객실 ID
    private LocalDate startDate;  // 체크인
    private LocalDate endDate;    // 체크아웃
    private int nights;           // 숙박일수
    private Integer quantity;     // 객실 수량
    private BigDecimal price;     // 객실 단가
    private RsvStatus rsvStatus;  // 예약 상태
    private int guestCount;       // 투숙인원
    private String accTitle;      // 숙소명
    private String roomName;      // 객실명

    public static RoomRsvResponseDTO fromEntity(RoomRsv entity) {
        return RoomRsvResponseDTO.builder()
                .reserveId(entity.getReserveId())
                .roomId(entity.getRoom().getRoomId())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .nights(entity.getNights())
                .quantity(entity.getQuantity())
                .price(entity.getPrice())
                .rsvStatus(entity.getRsvStatus())
                .guestCount(entity.getGuestCount())
                .build();
    }
}