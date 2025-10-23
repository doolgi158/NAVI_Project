package com.navi.user.repository;

import com.navi.payment.domain.PaymentMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface DashboardPaymentRepository extends JpaRepository<PaymentMaster, Long> {
    // 전체 결제 금액 합계
    @Query("""
            SELECT COALESCE(SUM(p.totalAmount), 0)
            FROM PaymentMaster p
            WHERE p.paymentStatus = 'PAID'
            """)
    long getTotalPaidAmount();

    // 이번 달 결제 수
    @Query("""
            SELECT COUNT(p)
            FROM PaymentMaster p
            WHERE p.paymentStatus = 'PAID'
            AND FUNCTION('TO_CHAR', p.createdAt, 'YYYYMM') = FUNCTION('TO_CHAR', CURRENT_DATE, 'YYYYMM')
            """)
    long getMonthlyPaymentCount();

    // 지난 달 결제 수
    @Query("""
            SELECT COUNT(p)
            FROM PaymentMaster p
            WHERE p.paymentStatus = 'PAID'
            AND FUNCTION('TO_CHAR', p.createdAt, 'YYYYMM') = FUNCTION('TO_CHAR', ADD_MONTHS(CURRENT_DATE, -1), 'YYYYMM')
            """)
    long getLastMonthPaymentCount();

    // 기간별 결제 총액
    @Query("""
            SELECT COALESCE(SUM(p.totalAmount), 0)
            FROM PaymentMaster p
            WHERE p.paymentStatus = 'PAID'
            AND p.createdAt BETWEEN :start AND :end
            """)
    BigDecimal sumAmountByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // 기간별 결제 건수
    @Query("""
            SELECT COUNT(p)
            FROM PaymentMaster p
            WHERE p.paymentStatus = 'PAID'
            AND p.createdAt BETWEEN :start AND :end
            """)
    long countPaymentsByDateRange(LocalDateTime start, LocalDateTime end);

    // 환불 건수
    @Query("""
            SELECT COUNT(p)
            FROM PaymentMaster p
            WHERE p.paymentStatus = 'REFUNDED'
            AND p.updatedAt BETWEEN :start AND :end
            """)
    long countRefundedByDateRange(LocalDateTime start, LocalDateTime end);
}
