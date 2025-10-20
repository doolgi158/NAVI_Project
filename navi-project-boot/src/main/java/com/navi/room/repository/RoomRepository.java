package com.navi.room.repository;

import com.navi.accommodation.domain.Acc;
import com.navi.room.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    /* 공통 기능 */
    // 1. 숙소별 객실 전체 조회
    List<Room> findByAcc(Acc acc);
    // 2. 숙소 ID(accId)로 객실 목록 조회
    List<Room> findByAcc_AccId(String accId);
    // 🔹 숙소별 + 예약 가능한 객실 조회 (isAvailable = true)
    //List<Room> findByAccAndIsAvailable(Acc acc, boolean isAvailable);

    /* 관리자 기능 */
    // 1. contentId 기준으로 객실 목록 조회
    List<Room> findAllByContentId(Long contentId);
    // 2. 객실 ID(roomId)로 단일 조회 (AccRsvServiceImpl 에서 사용)
    Optional<Room> findByRoomId(String roomId);
    // 3. 비정상적인 객실은 제외된 유효한 객실만 조회
    @Query("SELECT r FROM Room r WHERE r.weekdayFee > 0 AND r.weekendFee > 0 AND r.roomCnt > 0")
    List<Room> findValidRooms();
}
