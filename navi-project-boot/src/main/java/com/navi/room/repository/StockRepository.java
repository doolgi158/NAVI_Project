package com.navi.room.repository;

import com.navi.room.domain.Room;
import com.navi.room.domain.RoomStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<RoomStock, Long> {
    // 특정 객실 + 특정 날짜 재고 조회
    Optional<RoomStock> findByRoomAndStockDate(Room room, LocalDate stockDate);
    // 특정 객실 번호(Long) + 날짜 구간별 재고 조회
    List<RoomStock> findByRoom_RoomNoAndStockDateBetween(Long roomNo, LocalDate startDate, LocalDate endDate);
    // 특정 객실 + 특정 날짜 재고 존재 여부 확인
    boolean existsByRoomAndStockDate(Room room, LocalDate stockDate);
    // 특정 객실 ID(String) + 특정 날짜 재고 조회 (관리자/프론트 단건 조회용)
    Optional<RoomStock> findByRoom_RoomIdAndStockDate(String roomId, LocalDate stockDate);
    // 특정 객실 ID(String) + 날짜 구간별 재고 조회 (관리자용)
    List<RoomStock> findByRoom_RoomIdAndStockDateBetween(String roomId, LocalDate startDate, LocalDate endDate);
    // 스케줄러용 - 기준일 이전의 재고 전체 삭제
    int deleteAllByStockDateBefore(LocalDate date);
}
