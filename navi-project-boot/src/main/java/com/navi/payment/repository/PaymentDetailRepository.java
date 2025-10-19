package com.navi.payment.repository;

import com.navi.common.enums.RsvType;
import com.navi.payment.domain.PaymentDetail;
import com.navi.payment.domain.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentDetailRepository extends JpaRepository<PaymentDetail, Long> {
    /* === [기본 조회] === */
    // 예약 ID로 결제 상세 단건 조회
    Optional<PaymentDetail> findByReserveId(String reserveId);
    // 결제 마스터(merchantId) 기준 전체 상세 내역 조회
    List<PaymentDetail> findAllByPaymentMasterMerchantId(String merchantId);
    // 예약 유형별 상세 내역 조회 (예: ACC, AIR, DLV)
    List<PaymentDetail> findAllByRsvType(RsvType rsvType);
    // 특정 결제 + 예약유형 기준 조회 (예: 항공 환불 등)
    List<PaymentDetail> findAllByPaymentMasterMerchantIdAndRsvType(String merchantId, RsvType rsvType);

    /* === [관리자용] === */
    // 결제 상태별 상세 내역 조회
    List<PaymentDetail> findAllByPaymentStatus(PaymentStatus status);
}
