package com.navi.room.service;

import com.navi.accommodation.domain.Acc;
import com.navi.room.dto.api.RoomApiDTO;
import com.navi.room.dto.request.RoomRequestDTO;
import com.navi.room.dto.response.RoomListResponseDTO;
import com.navi.room.dto.response.RoomResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface RoomService {
    /* === 관리자 전용 CRUD (View) === */
    // 1. 객실 생성
    RoomResponseDTO createRoom(Long accNo, RoomRequestDTO dto);

    // 2. 객실 수정
    RoomResponseDTO updateRoom(Long roomNo, RoomRequestDTO dto);

    // 3. 객실 조회
    List<RoomApiDTO> getRoomListByAcc(Long accNo, String keyword);

    // 4. 객실 삭제
    void deleteRoom(Long roomNo);


    /* === 사용자 전용 조회 (View) === */
    // 1. 특정 숙소 객실 리스트
    List<RoomListResponseDTO> getRoomList(String accId);

    // 2. TODO: 특정 숙소 객실 상세
    RoomResponseDTO getRoomDetail(String roomId);

    // 3. 조건 검색
    List<RoomListResponseDTO> getAvailableRooms(
            String accId,
            LocalDate checkIn,
            LocalDate checkOut,
            Integer guestCount,
            Integer roomCount
    );

    /* === 비즈니스 로직 === */
    // 1. 숙소별 최저 숙박 요금 조회
    Integer findMinPriceByAcc(Acc acc, LocalDate checkIn, LocalDate checkOut);

    List<RoomResponseDTO> getRooms(String accId);
}
