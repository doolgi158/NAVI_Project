package com.navi.reservation.domain;

/*
 * ============================
 * [NAVI_RESERVATION] - Rsv
 * : 공통 예약 정보 관리 테이블
 * ============================
 * ㄴ 숙소, 항공, 짐배송 예약 유형을 통합 관리하며, 결제 정보 및 상태를 포함
 * ㄴ 결제 검증된 후 최종 확정값을 저장하는 마스터 테이블
 */

import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "NAVI_RESERVATION")   // indexes 추후 추가 예정
public class Rsv {
    // 예약 고유번호 (예: 20251007ACC001)
    @Id @Column(name = "reserve_id", length = 20, nullable = false)
    private String reserveId;

    // 예약자 회원번호 (예: 10001)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private User userNo;

    // 예약 대상 구분 (예: ACC, AIR, DLV)
    @Enumerated(EnumType.STRING)    // --> Enum 순서(기본) 대신 문자열로 안전하게 저장
    @Column(name = "target_type", length = 3, nullable = false)
    private TargetType targetType;

    // 예약 대상 ID (예: ACC003)
    @Column(name = "target_id", length = 20, nullable = false)
    private String targetId;

    // 예약 생성 일시 (예: 2025-10-07T13:45:12)
    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;

    // 결제 상태 (예: 결제대기, 결제완료, 결제실패, 결제취소)
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Nationalized @Column(name = "payment_status", length = 4, nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.결제대기;

    // 결제 승인번호 (예: IMP_67283051)
    @Column(name = "payment_id", length = 30)
    private String paymentId;

    // 결제 완료 일시 (예: 2025-10-07T13:47:03)
    @Column(name = "payment_time")
    private LocalDateTime paymentTime;

    // 결제 수단 (예: CARD, KAKAO_PAY, NAVER_PAY)
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 50)
    private PaymentMethod paymentMethod;

    // 총 결제 금액 (예: 128000)
    @Builder.Default
    @Column(name = "total_amount")
    private Integer totalAmount = 0;

    // 결제 실패 사유 (예: "카카오페이 승인 실패: 한도 초과")
    @Column(name = "payment_fail_reason", length = 200)
    private String paymentFailReason;

    /* === ENUM 정의 === */
    public enum TargetType { ACC, AIR, DLV }
    public enum PaymentStatus { 결제대기, 결제완료, 결제실패, 결제취소 }
    public enum PaymentMethod { CARD, KAKAO_PAY, NAVER_PAY }

    /* === 기본값 보정 === */
    @PrePersist
    public void prePersist() {
        if (paymentStatus == null) paymentStatus = PaymentStatus.결제대기;
        if (totalAmount == null) totalAmount = 0;
    }

    /* === 상태 변경 메서드 === */
    public void markAsPaid(String paymentId, PaymentMethod method) {
        this.paymentStatus = PaymentStatus.결제완료;
        this.paymentId = paymentId;
        this.paymentTime = LocalDateTime.now();
        this.paymentMethod = method;
    }

    public void markAsFailed(String reason) {
        this.paymentStatus = PaymentStatus.결제실패;
        this.paymentFailReason = reason;
    }

    public void markAsCancelled() {
        this.paymentStatus = PaymentStatus.결제취소;
    }
}
