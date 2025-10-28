package com.navi.room.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ReserverUpdateRequestDTO {
    /* === 예약자 정보 === */
    private String reserverName;        // 대표 예약자 이름
    private String reserverTel;         // 대표 예약자 연락처
    private String reserverEmail;       // 대표 예약자 이메일
    private String reserverBirth;    // 대표 예약자 생년월일
}
