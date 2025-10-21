package com.navi.room.repository;

import com.navi.room.domain.RoomRsv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRsvRepository extends JpaRepository<RoomRsv, Long> {
    /* 예약 ID로 전체 예약 조회 */
    List<RoomRsv> findAllByRoomRsvId(String roomRsvId);

    /* 단일 예약 조회 */
    Optional<RoomRsv> findByRoomRsvId(String roomRsvId);

    /* 사용자별 예약 목록 */
    @Query("SELECT r FROM RoomRsv r WHERE r.user.no = :userNo")
    List<RoomRsv> findAllByUserNo(Long userNo);

    /* 총 결제 금액 계산 */
    @Query("SELECT SUM(r.price * r.quantity) FROM RoomRsv r WHERE r.roomRsvId = :roomRsvId")
    BigDecimal sumTotalAmountByRoomRsvId(String roomRsvId);
}
