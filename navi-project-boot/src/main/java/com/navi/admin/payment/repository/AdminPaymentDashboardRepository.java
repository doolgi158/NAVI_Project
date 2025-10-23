package com.navi.admin.payment.repository;

import com.navi.payment.domain.PaymentMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface AdminPaymentDashboardRepository extends JpaRepository<PaymentMaster, Long> {
    // 전체 결제 금액 합계
    @Query("""
                SELECT COALESCE(SUM(p.totalAmount), 0)
                FROM PaymentMaster p
                WHERE p.paymentStatus = 'PAID'
            """)
    BigDecimal getTotalPaidAmount();

    // 특정 기간의 결제 총액
    @Query("""
                SELECT COALESCE(SUM(p.totalAmount), 0)
                FROM PaymentMaster p
                WHERE p.paymentStatus = 'PAID'
                  AND p.createdAt BETWEEN :start AND :end
            """)
    BigDecimal sumPaidAmountBetween(LocalDateTime start, LocalDateTime end);

    // 특정 기간의 결제 건수
    @Query("""
                SELECT COUNT(p)
                FROM PaymentMaster p
                WHERE p.paymentStatus = 'PAID'
                  AND p.createdAt BETWEEN :start AND :end
            """)
    long countPaidPaymentsBetween(LocalDateTime start, LocalDateTime end);

    // 특정 기간의 환불 건수
    @Query("""
                SELECT COUNT(p)
                FROM PaymentMaster p
                WHERE p.paymentStatus = 'REFUNDED'
                  AND p.updatedAt BETWEEN :start AND :end
            """)
    long countRefundedPaymentsBetween(LocalDateTime start, LocalDateTime end);
}
