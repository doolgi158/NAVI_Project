package com.navi.reservation.domain;

import com.navi.common.entity.BaseEntity;
import com.navi.reservation.domain.enums.PaymentMethod;
import com.navi.reservation.domain.enums.RsvStatus;
import com.navi.reservation.domain.enums.RsvType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/* ===========[NAVI_RESERVATION]===========
             결제 정보 관리 테이블
      에: 숙소, 항공, 짐배송 유형을 통합 관리
   ======================================== */

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "NAVI_RESERVATION")   // Todo: indexes 추후 추가 예정
public class Payment extends BaseEntity {
    /* === COLUMN 정의 === */
    // 예약 고유번호 (예: 20251007ACC001)
    @Id @Column(name = "payment_id", length = 20, nullable = false)
    private String paymentId;

    // 예약 대상 구분 (예: ACC, AIR, DLV)
    @Enumerated(EnumType.STRING)    // --> Enum 순서(기본) 대신 문자열로 안전하게 저장
    @Column(name = "target_type", length = 10, nullable = false)
    private RsvType targetType;

    // 예약 대상 ID (예: ACC003)
    @Column(name = "target_id", length = 20, nullable = false)
    private String targetId;

    // 결제 상태 (예: WAITING_PAYMENT, PAID, FAILED, CANCELLED, READY, TIMEOUT)
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20, nullable = false)
    private RsvStatus rsvStatus = RsvStatus.PENDING;

    // 결제 실패 사유 (예: "카카오페이 승인 실패: 한도 초과")
    @Column(name = "payment_fail_reason", length = 200)
    private String paymentFailReason;

    // 결제 승인번호 (예: IMP_67283051)
    @Column(name = "imp_id", length = 30)
    private String impId;

    // 결제 수단 (예: CARD, KAKAOPAY, TOSSPAY)
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 10)
    private PaymentMethod paymentMethod;

    // 총 결제 금액 (예: 128000)
    @Builder.Default
    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    // 수수료금액 (예: 8000)
    @Builder.Default
    @Column(name = "fee_amount", nullable = false)
    private Integer feeAmount = 0;

    // 실환불금액 (예: 120000)
    @Builder.Default
    @Column(name = "refund_amount", nullable = false)
    private Integer refundAmount = 0;

    // 환불사유 (예: "고객 요청에 따른 취소")
    @Column(name = "refund_reason", length = 200)
    private String refundReason;

    // 결제 생성일, 결제상태 수정일 자동 생성

    /** === 기본값 보정 === */
    @PrePersist
    public void prePersist() {
        if (rsvStatus == null) rsvStatus = RsvStatus.PENDING;
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
        if (feeAmount == null) feeAmount = 0;
        if (refundAmount == null) refundAmount = 0;
    }

    /** === 상태 변경 메서드 === */
    public void markAsPaid(String paymentId, PaymentMethod method) {
        this.rsvStatus = RsvStatus.PAID;
        this.paymentId = paymentId;
        this.paymentMethod = method;
    }
    public void markAsCancelled(String reason) {
        this.rsvStatus = RsvStatus.CANCELLED;
        this.paymentFailReason = reason;
    }
    public void markAsFailed(String reason) {
        this.rsvStatus = RsvStatus.FAILED;
        this.paymentFailReason = reason;
    }
    public void markAsRefunded(String reason) {
        this.rsvStatus = RsvStatus.REFUNDED;
        this.paymentFailReason = reason;
    }
    public void markReady() {
        this.rsvStatus = RsvStatus.READY;
        this.paymentId = null;               // 결제 승인번호 없음
        this.paymentMethod = null;           // 아직 결제수단 확정 전
        this.paymentFailReason = null;       // 실패 사유 초기화
    }
}
