package com.navi.accommodation.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccApiDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.dto.request.RoomRequestDTO;
import com.navi.accommodation.dto.response.RoomListResponseDTO;
import com.navi.accommodation.dto.response.RoomResponseDTO;

import java.io.IOException;
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
