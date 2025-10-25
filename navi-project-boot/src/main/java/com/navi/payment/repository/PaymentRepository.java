package com.navi.payment.repository;

import com.navi.common.enums.RsvType;
import com.navi.payment.domain.PaymentMaster;
import com.navi.payment.domain.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentMaster, Long> {
    /** === [기본] === */
    // 1. 결제 고유번호(merchantId)로 단건 조회 (검증 / 확정 시 사용)
    Optional<PaymentMaster> findByMerchantId(String merchantId);
    // 2. PG 승인번호(impUid)로 단건 조회 (중복 결제 검증 시 사용)
    Optional<PaymentMaster> findByImpUid(String impUid);
    // 3. paymentId 생성
    @Query(value = "SELECT PAYMENT_SEQ.NEXTVAL FROM DUAL", nativeQuery = true)
    Long getNextSeqVal();

    /* === [관리자용 결제 조회] === */
    // 전체 결제 내역
    @Query("SELECT pm FROM PaymentMaster pm ORDER BY pm.createdAt DESC")
    List<PaymentMaster> findAllMasters();
    // 결제 상태별 상세 내역 조회
    @Query("SELECT pm FROM PaymentMaster pm WHERE pm.paymentStatus = :status ORDER BY pm.createdAt DESC")
    List<PaymentMaster> findAllMastersByStatus(@Param("status") PaymentStatus status);
    /** === [관리자 조회 통합 쿼리] === */
    @Query("""
        SELECT DISTINCT pm
        FROM PaymentMaster pm
        WHERE (
            (:rsvType IS NULL OR EXISTS (
                SELECT pd FROM PaymentDetail pd
                WHERE pd.paymentMaster = pm
                AND pd.rsvType = :rsvType
            ))
            AND (:paymentStatus IS NULL OR pm.paymentStatus = :paymentStatus)
            AND (
                :keyword IS NULL 
                OR pm.merchantId LIKE %:keyword%
                OR EXISTS (
                    SELECT pd2 FROM PaymentDetail pd2
                    WHERE pd2.paymentMaster = pm
                    AND pd2.reserveId LIKE %:keyword%
                )
            )
        )
        ORDER BY pm.createdAt DESC
    """)
    List<PaymentMaster> findAllMastersDynamic(
            @Param("rsvType") RsvType rsvType,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("keyword") String keyword
    );

    // merchantId 단건 조회
    Optional<PaymentMaster> findOneByMerchantId(String merchantId);
}
