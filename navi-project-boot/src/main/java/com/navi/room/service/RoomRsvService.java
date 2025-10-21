package com.navi.room.service;

import com.navi.room.dto.request.RoomRsvRequestDTO;
import com.navi.room.dto.response.RoomRsvResponseDTO;

import java.math.BigDecimal;
import java.util.List;

public interface RoomRsvService {
    // 1. 단일 예약 생성 (결제 전)
    RoomRsvResponseDTO createRoomReservation(RoomRsvRequestDTO dto);
    // 2. 다중 예약 생성 (한 예약 ID에 여러 객실 포함)
    void createMultipleRoomReservations(String reserveId, Long userNo, List<RoomRsvRequestDTO> roomList);
    // 3. 예약 상태 변경
    void updateStatus(String reserveId, String status);
    // 4. 예약 조회
    List<RoomRsvResponseDTO> findAll();
    List<RoomRsvResponseDTO> findAllByUserId(String userId);
    RoomRsvResponseDTO findByRoomRsvId(String roomRsvId);
    // 5. 결제 검증용: 총 결제 금액 확인
    boolean verifyTotalAmount(String reserveId, BigDecimal paidAmount);
    // 6. 예약 ID별 객실 총 금액 합산 (결제 검증용)
    BigDecimal getTotalAmountByReserveId(String reserveId);
}
