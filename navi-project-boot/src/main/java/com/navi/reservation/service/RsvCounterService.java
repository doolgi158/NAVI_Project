package com.navi.reservation.service;

public interface RsvCounterService {
    // 예약번호 생성 (YYYYMMDD + TYPE + 일련번호)
    String generatedReserveId(String targetType);
}
