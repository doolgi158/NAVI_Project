package com.navi.room.service;

import com.navi.room.dto.request.RoomRequestDTO;
import com.navi.room.dto.response.RoomListResponseDTO;
import com.navi.room.dto.response.RoomResponseDTO;

import java.util.List;

public interface RoomService {
    /* === 관리자 전용 CRUD (View) === */
    RoomResponseDTO createRoom(Long accNo, RoomRequestDTO dto);
    RoomResponseDTO updateRoom(Long roomNo, RoomRequestDTO dto);
    List<RoomResponseDTO> getRoomsByAcc(Long accNo);
    void deleteRoom(Long roomNo);

    /* === 사용자 전용 조회 (View) === */
    // 특정 숙소 객실 리스트
    List<RoomListResponseDTO> getRoomList(String accId);
    // 특정 숙소 객실 상세
    RoomResponseDTO getRoomDetail(String roomId);
}
