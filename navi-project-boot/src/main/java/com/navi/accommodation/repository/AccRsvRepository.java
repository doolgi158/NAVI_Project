package com.navi.accommodation.repository;

import com.navi.accommodation.domain.AccRsv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AccRsvRepository extends JpaRepository<AccRsv, Long> {
    /* == 관리자용 == */
    // 1. 전체 숙소 예약 목록 조회
    // 2. 숙소별 예약 목록 조회(필터)
    // 3. 숙소별 예약 상세 정보 조회
    @Query("""
           SELECT DISTINCT ar FROM AccRsv ar
           JOIN FETCH ar.user u
           JOIN FETCH ar.room r
           ORDER BY ar.startDate DESC""")
    List<AccRsv> findAllDetails();

    /* == 사용자용 == */
    // 1. 사용자 ID별 숙소 예약 목록 조회
    @Query("""
            SELECT ar FROM AccRsv
            WHERE ar.user.userId = :userId""")
    List<AccRsv> findAllByUserNo(@Param("userId") Long userId);
    // 2. 예약 ID별 숙소 예약 상세 목록 조회
    @Query("""
           select distinct ar
           from AccRsv ar
           join fetch ar.room r
           where ar.arsvId = :reserveId
           order by ar.startDate
           """)
    List<AccRsv> findAllByReserveId(@Param("arsvId") String arsvId);

    /* == 비즈니스 로직용 == */
    // 1. 체크인 날짜 조회(환불 수수료 계산용)
    @Query(" SELECT ar.startDate FROM AccRsv ar WHERE ar.arsvId = :arsvId")
    LocalDate findCheckInDateByReserveId(@Param("arsvId") String arsvId);
}