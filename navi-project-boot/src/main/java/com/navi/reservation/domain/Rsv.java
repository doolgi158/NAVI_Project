package com.navi.reservation.domain;

/*
 * ===================================
 * Rsv : 예약 테이블
 * ===================================
 * ㄴ 결제 정보가 들어감
 */


/* [Column]
 * 1. 예약 ID(reserveId)           6. 결제 승인 ID(paymentId)
 * 2. 사용자 ID(userNo)             8. 결제 일시(paymentDate)
 * 3. 대상 구분(targetType)         9. 결제 수단(paymentMethod)
 * 4. 대상 ID(targetId)            10. 총 결제 금액(totalAmount)
 * 5. 결제 상태(paymentStatus)      11. 결제 실패 사유(paymentFailReason)
 */

import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
//@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "NAVI_RESERVATION")
public class Rsv {
    /* === ENUM 정의 === */
    public enum TargetType { ACC, AIR, DLV }
    public enum PaymentStatus { 결제대기, 결제완료, 결제실패, 결제취소 }
    public enum PaymentMethod { CARD, KAKAO_PAY, NAVER_PAY }

    /* === 컬럼 정의 === */
    @Id
    @Column(name = "reserve_id", length = 30, nullable = false)
    private String reserveId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private User userNo;

    @Column(name = "target_type", length = 3, nullable = false)
    private TargetType targetType;

    @Column(name = "target_id", length = 20, nullable = false)
    private String targetId;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;

    @Column(name = "payment_status", columnDefinition = "NVARCHAR2(4)", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.결제대기;

    @Column(name = "payment_id", length = 30)
    private String paymentId;

    @Column(name = "payment_time")
    private LocalDateTime paymentTime;

    @Column(name = "payment_method", length = 50, nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "total_amount")
    private Integer totalAmount = 0;

    @Column(name = "payment_fail_reason", length = 200)
    private String paymentFailReason;

    @PrePersist
    public void prePersist() {
        if (paymentStatus == null) paymentStatus = PaymentStatus.결제대기;
        if (totalAmount == null) totalAmount = 0;
    }

    public void changeFromRequestDTO() {

    }
}
