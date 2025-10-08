package com.navi.accommodation.dto.response;

import lombok.*;
import java.util.List;

/**
 * =======================
 * [RoomResponseDTO]
 * : 객실 정보 응답 DTO
 * =======================
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomResponseDTO {
    private String roomId;           // 객실 ID
    private String roomName;         // 객실명
    private Integer capacity;        // 수용 인원
    private Integer price;           // 1박 요금
    private Integer remainingRooms;  // 잔여 객실 수 (NAVI_ROOM_AVAIL 기반)
    private Boolean hasBreakfast;    // 조식 포함 여부 (선택)
    private List<String> roomImages; // 객실 이미지 리스트
}
