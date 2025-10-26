package com.navi.admin.payment.repository;

import com.navi.payment.domain.PaymentMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminPaymentDashboardRepository extends JpaRepository<PaymentMaster, Long> {

    // 전체 결제 금액 합계
    @Query("""
                SELECT COALESCE(SUM(p.totalAmount), 0)
                FROM PaymentMaster p
                WHERE p.paymentStatus = 'PAID'
            """)
    BigDecimal getTotalPaidAmount();

    // 특정 기간의 결제 건수
    @Query("""
                SELECT COUNT(p)
                FROM PaymentMaster p
                WHERE p.paymentStatus = 'PAID'
                AND p.createdAt BETWEEN :start AND :end
            """)
    long countPaidPaymentsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 월별 환불 건수 (REFUNDED + PARTIAL_REFUNDED)
    @Query("""
                SELECT COUNT(p)
                FROM PaymentMaster p
                WHERE p.paymentStatus IN ('REFUNDED', 'PARTIAL_REFUNDED')
                AND p.updatedAt BETWEEN :start AND :end
            """)
    long countRefundsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 전체 결제 수
    @Query("""
                SELECT COUNT(p)
                FROM PaymentMaster p
                WHERE p.updatedAt BETWEEN :start AND :end
            """)
    long countAllPaymentsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 특정 기간의 매출 합계
    @Query("""
                SELECT COALESCE(SUM(p.totalAmount), 0)
                FROM PaymentMaster p
                WHERE p.paymentStatus = 'PAID'
                AND p.createdAt BETWEEN :start AND :end
            """)
    BigDecimal sumPaidAmountBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 특정 기간의 환불 금액 합계 (REFUNDED + PARTIAL_REFUNDED)
    @Query("""
                SELECT COALESCE(SUM(p.totalFeeAmount), 0)
                FROM PaymentMaster p
                WHERE p.paymentStatus IN ('REFUNDED', 'PARTIAL_REFUNDED')
                AND p.updatedAt BETWEEN :start AND :end
            """)
    BigDecimal sumRefundAmountBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 결제 수단별 결제 건수
    @Query("""
                SELECT p.paymentMethod, COUNT(p)
                FROM PaymentMaster p
                WHERE p.paymentStatus = 'PAID'
                GROUP BY p.paymentMethod
            """)
    List<Object[]> countPaymentsByMethod();
}
