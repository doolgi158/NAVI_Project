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
    /**
     * === [기본] ===
     */
    // 1. 결제 고유번호(merchantId)로 단건 조회 (검증 / 확정 시 사용)
    Optional<PaymentMaster> findByMerchantId(String merchantId);

    // 2. PG 승인번호(impUid)로 단건 조회 (중복 결제 검증 시 사용)
    Optional<PaymentMaster> findByImpUid(String impUid);

    // 3. paymentId 생성
    @Query(value = "SELECT PAYMENT_MASTER_SEQ.NEXTVAL FROM DUAL", nativeQuery = true)
    Long getNextSeqVal();

    // 4. 유저 정보 찾기
    List<PaymentMaster> findAllByUser_No(Long userNo);

    /* === [관리자용 결제 조회] === */
    // 전체 결제 내역
    @Query("SELECT pm FROM PaymentMaster pm ORDER BY pm.createdAt DESC")
    List<PaymentMaster> findAllMasters();

    // 결제 상태별 상세 내역 조회
    @Query("SELECT pm FROM PaymentMaster pm WHERE pm.paymentStatus = :status ORDER BY pm.createdAt DESC")
    List<PaymentMaster> findAllMastersByStatus(@Param("status") PaymentStatus status);

    // 결제 유형별 조회 (숙소, 항공, 짐배송)
    @Query("""
                SELECT pm
                FROM PaymentMaster pm
                WHERE EXISTS (
                    SELECT 1
                    FROM PaymentDetail pd
                    WHERE pd.paymentMaster = pm AND pd.rsvType = :rsvType
                )
                ORDER BY pm.createdAt DESC
            """)
    List<PaymentMaster> findAllMastersByRsvType(@Param("rsvType") RsvType rsvType);

    // merchantId 단건 조회
    Optional<PaymentMaster> findOneByMerchantId(String merchantId);
}
