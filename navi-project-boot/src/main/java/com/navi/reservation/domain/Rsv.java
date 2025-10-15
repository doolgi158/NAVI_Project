//package com.navi.reservation.domain;
//
//import com.navi.reservation.domain.enums.PaymentMethod;
//import com.navi.reservation.domain.enums.RsvStatus;
//import com.navi.reservation.domain.enums.RsvType;
//import com.navi.user.domain.User;
//import jakarta.persistence.*;
//import lombok.*;
//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.OnDelete;
//import org.hibernate.annotations.OnDeleteAction;
//import org.springframework.data.annotation.LastModifiedDate;
//import org.springframework.data.jpa.domain.support.AuditingEntityListener;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//
///* ===========[NAVI_RESERVATION]===========
//             결제 정보 관리 테이블
//    에: 숙소, 항공, 짐배송 예약 유형을 통합 관리
//   ======================================== */
//
//@Getter
//@Builder
//@NoArgsConstructor
//@AllArgsConstructor
//@Entity
//@EntityListeners(AuditingEntityListener.class)
//@Table(name = "NAVI_RESERVATION")   // Todo: indexes 추후 추가 예정
//public class Rsv {
//    /** === COLUMN 정의 === */
//    // 예약 고유번호 (예: 20251007ACC001)
//    @Id @Column(name = "reserve_id", length = 20, nullable = false)
//    private String reserveId;
//
//    // 예약자 회원번호 (예: 10001)
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_no", nullable = true)
//    @OnDelete(action = OnDeleteAction.SET_NULL)
//    private User user;
//
//    // 예약 대상 구분 (예: ACC, AIR, DLV)
//    @Enumerated(EnumType.STRING)    // --> Enum 순서(기본) 대신 문자열로 안전하게 저장
//    @Column(name = "target_type", length = 10, nullable = false)
//    private RsvType rsvType;
//
//    // 예약 대상 ID (예: ACC003)
//    @Column(name = "target_id", length = 20, nullable = false)
//    private String targetId;
//
//    // 예약 시작 일시 (예: 2025-10-07T13:45:12)
//    @CreationTimestamp
//    private LocalDateTime createdTime;
//
//    // 결제 상태 (예: WAITING_PAYMENT, PAID, FAILED, CANCELLED, READY, TIMEOUT)
//    @Builder.Default
//    @Enumerated(EnumType.STRING)
//    @Column(name = "payment_status", length = 20, nullable = false)
//    private RsvStatus rsvStatus = RsvStatus.PENDING;
//
//    // 결제 승인번호 (예: IMP_67283051)
//    @Column(name = "payment_id", length = 30)
//    private String paymentId;
//
//    // 결제 완료/실패 일시 (예: 2025-10-07T13:47:03)
//    @LastModifiedDate
//    @Column(name = "payment_time")
//    private LocalDateTime paymentTime;
//
//    // 결제 수단 (예: CARD, KAKAO_PAY, NAVER_PAY)
//    @Enumerated(EnumType.STRING)
//    @Column(name = "payment_method", length = 10)
//    private PaymentMethod paymentMethod;
//
//    // 총 결제 금액 (예: 128000)
//    @Builder.Default
//    @Column(name = "total_amount", precision = 12, scale = 2)
//    private BigDecimal totalAmount = BigDecimal.ZERO;
//
//    // 결제 실패 사유 (예: "카카오페이 승인 실패: 한도 초과")
//    @Column(name = "payment_fail_reason", length = 200)
//    private String paymentFailReason;
//
//    /** === 기본값 보정 === */
//    @PrePersist
//    public void prePersist() {
//        if (rsvStatus == null) rsvStatus = RsvStatus.PENDING;
//        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
//    }
//
//    /** === 상태 변경 메서드 === */
//    public void markAsPaid(String paymentId, PaymentMethod method) {
//        this.rsvStatus = RsvStatus.PAID;
//        this.paymentId = paymentId;
//        this.paymentMethod = method;
//    }
//    public void markAsFailed(String reason) {
//        this.rsvStatus = RsvStatus.FAILED;
//        this.paymentFailReason = reason;
//    }
//    public void markAsCancelled(String reason) {
//        this.rsvStatus = RsvStatus.CANCELLED;
//        this.paymentFailReason = reason;
//    }
//    public void markReady() {
//        this.rsvStatus = RsvStatus.READY;
//        this.paymentId = null;               // 결제 승인번호 없음
//        this.paymentMethod = null;           // 아직 결제수단 확정 전
//        this.paymentFailReason = null;       // 실패 사유 초기화
//    }
//}