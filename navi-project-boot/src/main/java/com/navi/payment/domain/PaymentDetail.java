package com.navi.payment.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.navi.common.entity.BaseEntity;
import com.navi.common.enums.RsvType;
import com.navi.payment.domain.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/* ======================[NAVI_PAYMENT_DETAIL]======================
                            결제 상세 테이블
    EX) 결제 1건(PaymentMaster)에 속하는 여러 예약 항목별 결제 내역을 관리
   ================================================================= */

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "NAVI_PAYMENT_DETAIL")
@SequenceGenerator(
        name = "payment_detail_generator",
        sequenceName = "PAYMENT_DETAIL_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class PaymentDetail extends BaseEntity {
    /* === COLUMN 정의 === */
    // 내부 식별번호 (예: 1)
    @Id @Column(name = "no")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payment_detail_generator")
    private Long no;

    /* === 연관관계 정의 === */
    // 결제 마스터 FK (결제 고유번호: PAY20251007-0001)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", referencedColumnName = "merchant_id", nullable = false)
    @JsonBackReference
    private PaymentMaster paymentMaster;

    // 예약 항목 구분 (예: ACC, AIR, DLV)
    @Enumerated(EnumType.STRING)
    @Column(name = "reserve_type", length = 10, nullable = false)
    private RsvType reserveType;

    // 예약 항목 ID (예: 20251007ACC001)
    @Column(name = "reserve_id", length = 30, nullable = false)
    private String reserveId;

    // 결제 금액 (예: 100000)
    @Builder.Default
    @Column(name = "amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal amount = BigDecimal.ZERO;

    // 항목별 수수료 (예: 항공 편도당 5,000원)
    @Builder.Default
    @Column(name = "fee_amount", precision = 12, scale = 2)
    private BigDecimal feeAmount = BigDecimal.ZERO;

    // 결제 상태 (예: PAID, FAILED, REFUNDED)
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20, nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PAID;

    // 환불 사유
    @Column(name = "reason", length = 200)
    private String reason;

    /** === 기본값 보정 === */
    @PrePersist
    public void prePersist() {
        if (paymentStatus == null) paymentStatus = PaymentStatus.PAID;
        if (amount == null) amount = BigDecimal.ZERO;
        if (feeAmount == null) feeAmount = BigDecimal.ZERO;
    }

    /* === 상태 변경 메서드 === */
    // 1. 결제 완료 처리
    public void markAsPaid() {
        this.paymentStatus = PaymentStatus.PAID;
        this.reason = null;
    }
    // 2. 환불 완료 처리
    public void markAsRefunded(String reason) {
        this.paymentStatus = PaymentStatus.REFUNDED;
        this.reason = reason;
    }
    // 3. 부분 환불 처리
    public void markAsPartialRefunded(String reason) {
        this.paymentStatus = PaymentStatus.PARTIAL_REFUNDED;
        this.reason = reason;
    }

    /* 내부 도메인 제어용 setter (외부 접근 불가) */
    // 결제 상세 추가 헬퍼
    protected void setPaymentMaster(PaymentMaster paymentMaster) {
        this.paymentMaster = paymentMaster;
    }
}
