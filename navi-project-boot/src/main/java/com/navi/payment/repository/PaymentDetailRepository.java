package com.navi.payment.repository;

import com.navi.common.enums.RsvType;
import com.navi.payment.domain.PaymentDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentDetailRepository extends JpaRepository<PaymentDetail, Long> {
    /* == [사용자용] == */
    // 1. 예약 ID로 결제 상세 단건 조회
    Optional<PaymentDetail> findByReserveId(String reserveId);
    // 2. 결제 마스터(merchantId) 기준 전체 상세 내역 조회
    @Query("SELECT d FROM PaymentDetail d WHERE d.paymentMaster.merchantId = :merchantId")
    List<PaymentDetail> findAllByMerchantId(@Param("merchantId") String merchantId);
    // 3. 예약 유형별 상세 내역 조회 (예: ACC, AIR, DLV)
    @Query("SELECT d FROM PaymentDetail d WHERE d.reserveType = :reserveType")
    List<PaymentDetail> findAllByReserveType(@Param("reserveType") String reserveType);
    // 4. 항공 전체 환불용 (같은 merchantId + reserveType=AIR)
    @Query("""
        SELECT d
        FROM PaymentDetail d
        WHERE d.paymentMaster.merchantId = :merchantId
          AND d.reserveType = :reserveType
    """)
    List<PaymentDetail> findAllByMerchantIdAndReserveType(
            @Param("merchantId") String merchantId,
            @Param("reserveType") RsvType reserveType
    );

    /* == [관리자용] == */
    // 1. 결제 상태별 상세 내역 조회
    @Query("SELECT d FROM PaymentDetail d WHERE d.paymentStatus = :status")
    List<PaymentDetail> findAllByPaymentStatus(@Param("status") String status);
}
