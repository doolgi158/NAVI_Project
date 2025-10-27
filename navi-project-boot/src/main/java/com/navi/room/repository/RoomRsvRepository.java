package com.navi.room.repository;

import com.navi.common.enums.RsvStatus;
import com.navi.room.domain.RoomRsv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRsvRepository extends JpaRepository<RoomRsv, Long> {
    /* 예약 ID로 전체 예약 조회 */
    List<RoomRsv> findAllByReserveId(String reserveId);
    /* 단일 예약 조회 */
    Optional<RoomRsv> findByReserveId(String reserveId);
    /* 사용자별 예약 목록 */
    @Query("SELECT r FROM RoomRsv r WHERE r.user.no = :userNo")
    List<RoomRsv> findAllByUserNo(Long userNo);
    /* 총 결제 금액 계산 */
    @Query("SELECT SUM(r.price * r.quantity) FROM RoomRsv r WHERE r.reserveId = :reserveId")
    BigDecimal sumTotalAmountByReserveId(String reserveId);
    /* 예약 만료된 숙소 예약 조회 */
    @Query("SELECT r FROM RoomRsv r WHERE r.rsvStatus = :status AND r.createdAt < :threshold")
    List<RoomRsv> findExpiredReservations(@Param("status") RsvStatus status,
                                          @Param("threshold") LocalDateTime threshold);
    /* 삭제 시점(오늘) 이후의 예약이 있는지 개수 체크 */
    long countByRoom_Acc_AccNoAndEndDateGreaterThanEqual(Long accNo, LocalDate date);
}
