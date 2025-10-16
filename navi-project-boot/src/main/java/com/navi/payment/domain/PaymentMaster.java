package com.navi.payment.domain;

import com.navi.payment.domain.enums.PaymentMethod;
import com.navi.common.entity.BaseEntity;
import com.navi.payment.domain.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/* ===========[NAVI_PAYMENT]===========
             결제 마스터 테이블
   ==================================== */

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "NAVI_PAYMENT")   // Todo: indexes 추후 추가 예정
@SequenceGenerator(
        name = "payment_generator",
        sequenceName = "PAYMENT_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class PaymentMaster extends BaseEntity {
    /* === COLUMN 정의 === */
    // 내부 식별번호 (예: 1)
    @Id @Column(name = "no")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payment_generator")
    private Long no;

    // 결제 고유번호 (예: PAY20251007-0001)
    @Column(name = "merchant_id", length = 30, nullable = false, unique = true)
    private String merchantId;

    // 결제 상태 (예: PAID, READY, CANCELLED, REFUNDED)
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20, nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PAID;

    // PG 승인번호 (예: IMP_67283051)
    @Column(name = "imp_uid", length = 30)
    private String impUid;

    // 결제 수단 (예: KGINIPAY, KAKAOPAY, TOSSPAY)
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 10)
    private PaymentMethod paymentMethod;

    // 총 결제 금액 (예: 128000)
    @Builder.Default
    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    // 수수료금액 (예: 8000)
    @Builder.Default
    @Column(name = "fee_amount", precision = 12, scale = 2)
    private BigDecimal feeAmount = BigDecimal.ZERO;

    // 실환불금액 (예: 120000)
    @Builder.Default
    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount = BigDecimal.ZERO;

    // 사유 (예: "고객 요청에 따른 취소") - 결제 실패, 취소, 환불 등 모든 사유를 통합 관리
    @Column(name = "reason", length = 200)
    private String reason;

    // 결제 생성일, 결제상태 수정일 자동 생성

    /** === 기본값 보정 === */
    @PrePersist
    public void prePersist() {
        if (paymentStatus == null) paymentStatus = PaymentStatus.PAID;
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
        if (feeAmount == null) feeAmount = BigDecimal.ZERO;
        if (refundAmount == null) refundAmount = BigDecimal.ZERO;

        // merchantId 자동 생성
        if(merchantId == null && no != null){
            String today = LocalDate.now(ZoneId.of("Asia/Seoul")).format(DateTimeFormatter.BASIC_ISO_DATE); // yyyyMMdd
            merchantId = String.format("PAY%s-%04d", today, no);
        }
    }

    /* === 상태 변경 메서드 === */
    // 1. 결제 요청 준비 상태로 전환
    public void markAsReady() {
        this.paymentStatus = PaymentStatus.READY;
        this.reason = null;
    }

    // 2. 결제 완료 처리
    public void markAsPaid(String impUid, PaymentMethod method) {
        this.paymentStatus = PaymentStatus.PAID;
        this.impUid = impUid;
        this.paymentMethod = method;
        this.reason = null;
    }

    // 3. 결제 취소 처리
    public void markAsCancelled(String reason) {
        this.paymentStatus = PaymentStatus.CANCELLED;
        this.reason = reason;
    }

    // 4. 결제 실패 처리
    public void markAsFailed(String reason) {
        this.paymentStatus = PaymentStatus.FAILED;
        this.reason = reason;
    }

    // 5. 환불 완료 처리
    public void markAsRefunded(String reason, BigDecimal refundAmount) {
        this.paymentStatus = PaymentStatus.REFUNDED;
        this.refundAmount = refundAmount != null ? refundAmount : BigDecimal.ZERO;
        this.reason = reason;
    }

    // 6. 부분 환불 처리
    public void markAsPartialRefunded(String reason, BigDecimal refundAmount) {
        this.paymentStatus = PaymentStatus.PARTIAL_REFUNDED;
        this.refundAmount = refundAmount != null ? refundAmount : BigDecimal.ZERO;
        this.reason = reason;
    }
}
