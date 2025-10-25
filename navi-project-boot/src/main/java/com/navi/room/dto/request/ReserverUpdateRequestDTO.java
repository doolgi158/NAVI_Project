package com.navi.room.dto.request;

import lombok.Data;

@Data
public class ReserverUpdateRequestDTO {
    /* === 예약자 정보 === */
    private String reserverName;    // 대표 예약자 이름
    private String reserverTel;     // 대표 예약자 연락처
    private String reserverEmail;   // 대표 예약자 이메일
}
