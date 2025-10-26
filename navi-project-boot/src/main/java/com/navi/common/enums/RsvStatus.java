package com.navi.common.enums;

public enum RsvStatus {
    PENDING,        // 예약 생성 중 (결제 미확정)
    PAID,           // 결제 완료 (예약 확정)
    CANCELLED,      // 예약 취소
    REFUNDED,       // 환불 완료
    FAILED,         // 예약 또는 결제 실패
    COMPLETE,       // 이용 완료
}
