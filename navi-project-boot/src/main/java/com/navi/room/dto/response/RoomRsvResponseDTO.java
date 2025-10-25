package com.navi.room.dto.response;

import com.navi.common.enums.RsvStatus;
import com.navi.room.domain.RoomRsv;
import lombok.*;

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
    private int guestCount;       // 숙박인원
    private Integer quantity;     // 객실 수량
    private BigDecimal price;     // 객실 단가
    private RsvStatus rsvStatus;  // 예약 상태
    private String reserverName;    // 대표 예약자 이름
    private String reserverTel;     // 대표 예약자 연락처
    private String reserverEmail;   // 대표 예약자 이메일

    public static RoomRsvResponseDTO fromEntity(RoomRsv entity) {
        return RoomRsvResponseDTO.builder()
                .reserveId(entity.getReserveId())
                .roomId(entity.getRoom().getRoomId())
                .reserverName(entity.getReserverName())
                .reserverTel(entity.getReserverTel())
                .reserverEmail(entity.getReserverEmail())
                .guestCount(entity.getGuestCount())
                .quantity(entity.getQuantity())
                .price(entity.getPrice())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .nights(entity.getNights())
                .rsvStatus(entity.getRsvStatus())
                .build();
    }
}