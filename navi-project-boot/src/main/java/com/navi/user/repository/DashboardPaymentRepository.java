package com.navi.user.repository;

import com.navi.payment.domain.PaymentMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardPaymentRepository extends JpaRepository<PaymentMaster, Long> {
    // 1. 전체 결제 금액 합계
    @Query("""
        SELECT COALESCE(SUM(p.totalAmount), 0)
        FROM PaymentMaster p
        WHERE p.paymentStatus = com.navi.payment.domain.enums.PaymentStatus.PAID
    """)
    long getTotalPaidAmount();
    // 2. 이번 달 결제 수
    @Query("""
        SELECT COUNT(p)
        FROM PaymentMaster p
        WHERE p.paymentStatus = com.navi.payment.domain.enums.PaymentStatus.PAID
        AND FUNCTION('TO_CHAR', p.createdAt, 'YYYYMM') = FUNCTION('TO_CHAR', CURRENT_DATE, 'YYYYMM')
    """)
    long getMonthlyPaymentCount();
    // 3. 지난 달 결제 수
    @Query("""
        SELECT COUNT(p)
        FROM PaymentMaster p
        WHERE p.paymentStatus = com.navi.payment.domain.enums.PaymentStatus.PAID
        AND FUNCTION('TO_CHAR', p.createdAt, 'YYYYMM') = FUNCTION('TO_CHAR', ADD_MONTHS(CURRENT_DATE, -1), 'YYYYMM')
    """)
    long getLastMonthPaymentCount();
}
