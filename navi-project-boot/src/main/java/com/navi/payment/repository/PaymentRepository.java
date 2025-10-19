package com.navi.payment.repository;

import com.navi.payment.domain.PaymentMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentMaster, Long> {
    /** === [기본 조회] === */
    // 1. 결제 고유번호(merchantId)로 단건 조회 (검증 / 확정 시 사용)
    Optional<PaymentMaster> findByMerchantId(String merchantId);
    // 2. PG 승인번호(impUid)로 단건 조회 (중복 결제 검증 시 사용)
    Optional<PaymentMaster> findByImpUid(String impUid);

    /* === [사용자용 - 추후 확장] === */
    // TODO: PaymentMaster <-> User 관계 매핑 후 활성화
    // List<PaymentMaster> findAllByUser_UserNo(Long userNo);
}
