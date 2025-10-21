package com.navi.room.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomPreRsvResponseDTO {
    private boolean success;     // 요청 처리 성공 여부
    private String reserveId;    // 예약 ID (임시)
    private String message;      // 결과 메시지 (로그용)
}
