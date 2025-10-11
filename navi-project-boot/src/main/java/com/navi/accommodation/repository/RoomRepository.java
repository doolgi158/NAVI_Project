package com.navi.accommodation.repository;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface RoomRepository extends JpaRepository<Room, Long> {
    // 숙소별 객실 전체 조회
    List<Room> findByAcc(Acc acc);
    List<Room> findByAcc_AccId(String accId);

    // contentid 기준으로 조회
    List<Room> findAllByContentId(Long contentId);

}
