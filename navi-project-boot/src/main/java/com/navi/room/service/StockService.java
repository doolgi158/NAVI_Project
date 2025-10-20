package com.navi.room.service;

import com.navi.room.domain.Room;
import com.navi.room.domain.RoomStock;
import com.navi.room.dto.request.StockRequestDTO;
import com.navi.room.dto.response.StockResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface StockService {
    // 특정 객실 ID 기준으로 기간별 재고 조회
    List<StockResponseDTO> getStockByRoomAndPeriod(String roomId, LocalDate startDate, LocalDate endDate);
    // 예약 발생 시 재고 차감
    void decreaseStock(Room room, LocalDate startDate, LocalDate endDate, int qty);
    // 예약 취소 시 재고 복구
    void increaseStock(Room room, LocalDate startDate, LocalDate endDate, int qty);
    // 특정 날짜에 재고 없을 경우 새로 생성 (하이브리드 방식 지원)
    RoomStock createIfMissing(Room room, LocalDate stockDate);
}
