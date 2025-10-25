package com.navi.payment.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.navi.payment.domain.enums.PaymentMethod;
import com.navi.common.entity.BaseEntity;
import com.navi.payment.domain.enums.PaymentStatus;
import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "NAVI_PAYMENT",
        indexes = {
                @Index(name = "IDX_PAYMENT_USER", columnList = "user_no"),
                @Index(name = "IDX_PAYMENT_MERCHANT", columnList = "merchant_id")
        }
)
@SequenceGenerator(
        name = "payment_master_generator",
        sequenceName = "PAYMENT_MASTER_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class PaymentMaster extends BaseEntity {
    /* === COLUMN 정의 === */
    // 내부 식별번호 (예: 1)
    @Id @Column(name = "no")
    private Long no;

    /* 연관관계 설정 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private User user;

    // 결제 고유번호 (예: PAY20251007-0001)
    @Column(name = "merchant_id", length = 30, nullable = false, unique = true)
    private String merchantId;

    // 결제 상태 (예: PAID, READY, CANCELLED, REFUNDED)
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20, nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.READY;

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

    // 실환불금액 (예: 120000)
    @Builder.Default
    @Column(name = "total_fee_amount", precision = 12, scale = 2)
    private BigDecimal totalFeeAmount = BigDecimal.ZERO;

    // 결제 취소/실패 사유
    @Column(name = "reason", length = 200)
    private String reason;

    /* === 기본값 보정 === */
    @PrePersist
    public void prePersist() {
        if (paymentStatus == null) paymentStatus = PaymentStatus.READY;
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
        if (totalFeeAmount == null) totalFeeAmount = BigDecimal.ZERO;
    }

    /* === 연관관계 정의 === */
    @Builder.Default
    @OneToMany(mappedBy = "paymentMaster",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY,
            orphanRemoval = true)
    @JsonManagedReference
    private List<PaymentDetail> paymentDetails = new ArrayList<>();

    // 결제 상세 추가 헬퍼
    public void addPaymentDetail(PaymentDetail detail) {
        if (detail == null) return;
        detail.setPaymentMaster(this);      // 내부 제어용 setter 호출
        this.paymentDetails.add(detail);
    }

    /* merchant_id 생성 메서드 */
    public void assignMerchantId(String merchantId) {
        if (this.merchantId == null) {
            this.merchantId = merchantId;
        } else {
            throw new IllegalStateException("merchantId는 이미 지정되었습니다.");
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
    public void markAsRefunded(BigDecimal totalFeeAmount) {
        this.paymentStatus = PaymentStatus.REFUNDED;
        this.totalFeeAmount = totalFeeAmount != null ? totalFeeAmount : BigDecimal.ZERO;
    }
    // 6. 부분 환불 완료 처리
    public void markAsPartialRefunded(BigDecimal totalFeeAmount) {
        this.paymentStatus = PaymentStatus.PARTIAL_REFUNDED;
        this.totalFeeAmount = totalFeeAmount != null ? totalFeeAmount : BigDecimal.ZERO;
    }

    /* === 결제 금액 변경 === */
    public void updateTotalAmount(BigDecimal totalAmount) {
        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("총 결제 금액은 0 이상이어야 합니다.");
        }
        this.totalAmount = totalAmount;
    }

    /* === impUid 선 할당 === */
    public void assignImpUid(String impUid) {
        if (this.impUid == null || this.impUid.isBlank()) {
            this.impUid = impUid;
        } else {
            throw new IllegalArgumentException("이미 impUid가 존재합니다.");
        }
    }
}
