//package com.navi.reservation.domain;
//
//import jakarta.persistence.*;
//import lombok.*;
//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.OnDelete;
//import org.hibernate.annotations.OnDeleteAction;
//
//import java.time.LocalDateTime;
//
///*
// * ===================================
// * [NAVI_REFUND] - Refund
// * : 예약 1건당 1회 환불 정보 관리 테이블
// * ===================================
// * ㄴ 단일 환불로 처리(전체환불 또는 환불 수수료 처리)
// */
//
//@Getter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//@Entity
//@Table(name = "NAVI_REFUND")
//@SequenceGenerator(
//        name = "navi_refund_generator",
//        sequenceName = "navi_refund_seq",
//        initialValue = 1,
//        allocationSize = 1)
//public class Refund {
//    /* === COLUMN 정의 === */
//    // 환불 고유번호 (자동 증가)
//    @Id
//    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "navi_refund_seq")
//    @Column(name = "refund_id", nullable = false)
//    private Long refundId;
//
//    // 예약 고유번호 (예: 20251007ACC001)
//    @OneToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "reserve_id", nullable = false, unique = true)
//    @OnDelete(action = OnDeleteAction.NO_ACTION)
//    private Rsv rsv;
//
//    // 원결제금액 (예: 128000)
//    @Builder.Default
//    @Column(name = "original_amount", nullable = false)
//    private Integer originalAmount = 0;
//
//    // 수수료금액 (예: 8000)
//    @Builder.Default
//    @Column(name = "fee_amount", nullable = false)
//    private Integer feeAmount = 0;
//
//    // 실환불금액 (예: 120000)
//    @Builder.Default
//    @Column(name = "amount", nullable = false)
//    private Integer amount = 0;
//
//    // 환불일시 (예: 2025-10-07T15:31:45)
//    @CreationTimestamp
//    @Column(name = "refund_date", updatable = false)
//    private LocalDateTime refundDate;
//
//    // 환불사유 (예: "고객 요청에 따른 취소")
//    @Column(name = "reason", length = 200)
//    private String reason;
//
//    // 환불상태 (예: 환불요청, 환불진행, 환불완료, 환불거절)
//    @Builder.Default
//    @Enumerated(EnumType.STRING)
//    @Column(name = "status", columnDefinition = "NVARCHAR2(4)", nullable = false)
//    private RefundStatus status = RefundStatus.환불요청;
//
//    /* === ENUM 정의 === */
//    public enum RefundStatus { 환불요청, 환불진행, 환불완료, 환불거절 }
//
//    /* === 상태 변경 메서드 === */
//    public void markAsProcessing() {
//        status = RefundStatus.환불진행;
//    }
//    public void markAsCompleted() {
//        status = RefundStatus.환불완료;
//    }
//    public void markAsDenied(String reason) {
//        this.status = RefundStatus.환불거절;
//        this.reason = reason;
//    }
//
//    /* === 기본값 보정 === */
//    @PrePersist
//    public void prePersist() {
//        if (originalAmount == null) originalAmount = 0;
//        if (feeAmount == null) feeAmount = 0;
//        if (amount == null) amount = 0;
//        if (status == null) status = RefundStatus.환불요청;
//    }
//}