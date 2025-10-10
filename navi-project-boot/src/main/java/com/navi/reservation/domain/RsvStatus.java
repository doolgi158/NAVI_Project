package com.navi.reservation.domain;

public enum RsvStatus {
    WAITING_PAYMENT,    // 결제 대기
    PAID,               // 결제
    CANCELLED,          // 결제 취소
    //TIMEOUT,          // Todo: 결제 시간초과
    FAILED;             // 결제 실패
}