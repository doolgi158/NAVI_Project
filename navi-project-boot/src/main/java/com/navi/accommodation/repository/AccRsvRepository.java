//package com.navi.accommodation.repository;
//
//import com.navi.accommodation.domain.AccRsv;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.time.LocalDate;
//import java.util.List;
//
//@Repository
//public interface AccRsvRepository extends JpaRepository<AccRsv, Long> {
//    // 전체 숙소 예약 상세 목록 조회(관리자용)
//    @Query("SELECT ar FROM AccRsv ar ORDER BY ar.startDate DESC")
//    List<AccRsv> findAllDetails();
//
//    // 사용자 ID별 숙소 예약 상세 목록 조회
//    @Query("SELECT ar FROM AccRsv ar WHERE ar.rsv.user.no = :userNo ORDER BY ar.startDate DESC")
//    List<AccRsv> findAllByUserNo(@Param("userNo") Long userNo);
//
//    // 예약 ID별 숙소 예약 상세 목록 조회
//    @Query("SELECT ar FROM AccRsv ar WHERE ar.rsv.reserveId = :reserveId ORDER BY ar.startDate")
//    List<AccRsv> findAllByReserveId(@Param("reserveId") String reserveId);
//
//    // 체크인 날짜 조회(환불용)
//    @Query("SELECT MIN(ar.startDate) FROM AccRsv ar WHERE ar.rsv.reserveId = :reserveId")
//    LocalDate findCheckInDateByReserveId(@Param("reserveId") String reserveId);
//}