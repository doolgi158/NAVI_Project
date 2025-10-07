package com.navi.reservation.repository;

import com.navi.reservation.domain.Rsv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RsvRepository extends JpaRepository<Rsv, String> {
    /** === 관리자 기능 === */
    // 회원번호 기준으로 예약 전체 조회
    @Query("SELECT r FROM Rsv r WHERE r.userNo.no = :userNo ORDER BY r.createdTime DESC")
    List<Rsv> findAllByUser(@Param("userNo") Long userNo);

    // 결제상태별 조회
    @Query("SELECT r FROM Rsv r WHERE r.paymentStatus = :status")
    List<Rsv> findAllByPaymentStatus(@Param("status") Rsv.PaymentStatus status);

    /** === 사용자 기능 === */
    // 예약 ID로 단일 조회
    @Query("SELECT r FROM Rsv r WHERE r.reserveId = :reserveId")
    Optional<Rsv> findByReserveId(@Param("reserveId") String reserveId);
}