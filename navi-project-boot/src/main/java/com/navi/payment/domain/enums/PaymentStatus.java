package com.navi.payment.domain.enums;

public enum PaymentStatus {
    READY,              // 결제 요청 준비 (결제창 오픈 전)
    PAID,               // 결제 승인 완료
    FAILED,             // 결제 실패 (승인 거절, 잔액 부족 등)
    CANCELLED,          // 결제 취소 (사용자 또는 관리자)
    REFUNDED,           // 환불 완료
    PARTIAL_REFUNDED    // 부분 환불 (왕복 중 1건 등)
}
