package com.navi.reservation.repository;

import com.navi.reservation.domain.Refund;
import com.navi.reservation.domain.Rsv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {
    /* === 관리자 기능 === */
    // 전체 환불 내역 조회
    @Query("SELECT r FROM Refund r ORDER BY r.refundDate DESC")
    List<Refund> findAllRefunds();

    // 환불 상태별 목록 조회
    @Query("SELECT r FROM Refund r WHERE r.status = :status ORDER BY r.refundDate DESC")
    List<Refund> findAllByStatus(@Param("status") Refund.RefundStatus status);

    /* === 사용자 기능 === */
    // 예약 ID로 환불 단건 조회
    @Query("SELECT r FROM Refund r WHERE r.rsv.reserveId = :reserveId")
    Optional<Refund> findByReserveId(@Param("reserveId") String reserveId);

    // 중복 환불 방지용 메서드
    boolean existsByRsv(Rsv rsv);
}
