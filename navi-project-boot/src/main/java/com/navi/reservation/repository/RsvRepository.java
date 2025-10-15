//package com.navi.reservation.repository;
//
//import com.navi.reservation.domain.Rsv;
//import com.navi.reservation.domain.enums.RsvStatus;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.math.BigDecimal;
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface RsvRepository extends JpaRepository<Rsv, String> {
//    /* === 관리자 기능 === */
//    // 1. 회원번호 기준으로 예약 전체 조회
//    @Query("SELECT r FROM Rsv r WHERE r.user.no = :no ORDER BY r.createdTime DESC")
//    List<Rsv> findAllByUser_No(@Param("no") Long no);
//    // 2. 결제상태별 예약 목록 조회
//    @Query("SELECT r FROM Rsv r WHERE r.rsvStatus = :status")
//    List<Rsv> findAllByRsvStatus(@Param("status") RsvStatus rsvStatus);
//
//    /* === 사용자 기능 === */
//    // 1. 예약 ID로 단일 조회
//    @Query("SELECT r FROM Rsv r WHERE r.reserveId = :reserveId")
//    Optional<Rsv> findByReserveId(@Param("reserveId") String reserveId);
//
//    /* === 결제 검증용  === */
//    @Query("SELECT r.totalAmount FROM Rsv r WHERE r.reserveId = :reserveId")
//    BigDecimal findTotalAmountByReserveId(@Param("reserveId") String reserveId);
//}