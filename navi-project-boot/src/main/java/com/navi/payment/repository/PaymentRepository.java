package com.navi.payment.repository;

import com.navi.common.enums.RsvStatus;
import com.navi.payment.domain.PaymentMaster;
import com.navi.common.enums.RsvType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentMaster, Long> {
    /* == [기본 조회] == */
    // 1. 결제 고유번호(merchantId)로 단건 조회 (검증 / 확정 시 사용)
    Optional<PaymentMaster> findByMerchantId(String merchantId);

    // 2. PG 승인번호(impUid)로 단건 조회 (중복 결제 검증 시 사용)
    Optional<PaymentMaster> findByImpUid(String impUid);

    /* == [사용자용] == */
    // 3. 사용자 번호(user_no)로 결제 내역 전체 조회 (마이페이지용)
    List<PaymentMaster> findAllByUser_UserNo(Long userNo);
}
