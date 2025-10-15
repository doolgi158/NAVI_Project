package com.navi.room.repository;

import com.navi.accommodation.domain.Acc;
import com.navi.room.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;
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

    /* 관리자 기능 */
    // 1. contentId 기준으로 객실 목록 조회
    List<Room> findAllByContentId(Long contentId);
    // 2. 객실 ID(roomId)로 단일 조회 (AccRsvServiceImpl 에서 사용)
    Optional<Room> findByRoomId(String roomId);
}
