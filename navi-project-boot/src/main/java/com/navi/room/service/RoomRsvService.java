package com.navi.room.service;

import com.navi.room.dto.request.RoomRsvRequestDTO;
import com.navi.room.dto.response.RoomPreRsvResponseDTO;
import com.navi.room.dto.response.RoomRsvResponseDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface RoomRsvService {
    // 1. 단일 예약 생성 (결제 전)
    RoomPreRsvResponseDTO createRoomReservation(RoomRsvRequestDTO dto);
    // 2. 다중 예약 생성 (한 예약 ID에 여러 객실 포함)
    RoomPreRsvResponseDTO createMultipleRoomReservations(List<RoomRsvRequestDTO> roomList);
    // 3. 예약 상태 변경
    void updateStatus(String reserveId, String status);
    // 4. 예약 정보 갱신
    void updateReserverInfo(String reserveId, String name, String tel, String email, String birth);
    // 5. 예약 조회
    List<RoomRsvResponseDTO> findAllByUserId(String userId);
    RoomRsvResponseDTO findByReserveId(String roomRsvId);
    // 6. 결제 검증용: 총 결제 금액 확인
    boolean verifyTotalAmount(String reserveId, BigDecimal paidAmount);
    // 7. 예약 ID별 객실 총 금액 합산 (결제 검증용)
    BigDecimal getTotalAmountByReserveId(String reserveId);

    // 8. 관리자 예약 목록 조회
    Map<String, Object> getAdminReservationList(int page, int size, String status, String keyword);
    // 9. 예약 상태 조회
    String getReservationStatus(String reserveId);
    // 10. 예약 삭제
    void deleteReservationByReserveId(String reserveId);
}
