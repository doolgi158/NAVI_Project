package com.navi.room.service;

import com.navi.accommodation.domain.Acc;
import com.navi.room.domain.Room;
import com.navi.room.dto.request.RoomRequestDTO;
import com.navi.room.dto.response.RoomListResponseDTO;
import com.navi.room.dto.response.RoomResponseDTO;
import com.navi.accommodation.repository.AccRepository;
import com.navi.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class RoomServiceImpl implements RoomService {
    public final AccRepository accRepository;
    public final RoomRepository roomRepository;

    /* === 관리자 전용 CRUD === */
    @Override
    public RoomResponseDTO createRoom(Long accNo, RoomRequestDTO dto) {
        Acc acc = accRepository.findById(accNo)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));

        Room room = Room.builder()
                .acc(acc)
                .roomName(dto.getRoomName())
                .roomSize(Integer.parseInt(dto.getRoomSize()))
                .roomCnt(Integer.parseInt(dto.getRoomCnt()))
                .baseCnt(Integer.parseInt(dto.getBaseCnt()))
                .maxCnt(Integer.parseInt(dto.getMaxCnt()))
                .weekdayFee(Integer.parseInt(dto.getWeekdayFee()))
                .weekendFee(Integer.parseInt(dto.getWeekendFee()))
                .hasWifi("1".equals(dto.getHasWifi()))
                .build();

        Room saved = roomRepository.save(room);
        log.info("[ADMIN] 객실 등록 완료 → {} ({})", saved.getRoomName(), acc.getTitle());

        return RoomResponseDTO.fromEntity(saved);
    }

    @Override
    public RoomResponseDTO updateRoom(Long roomNo, RoomRequestDTO dto) {
        return null;
    }

    @Override
    public List<RoomResponseDTO> getRoomsByAcc(Long accNo) {
        return List.of();
    }

    @Override
    public void deleteRoom(Long roomNo) {

    }

    /* 사용자 전용 */
    // 숙소별 객실 리스트 조회
    @Override
    public List<RoomListResponseDTO> getRoomList(String accId) {
        List<Room> rooms = roomRepository.findByAcc_AccId(accId);

        if (rooms.isEmpty()) {
            log.warn("[USER] 해당 숙소({})의 객실 정보가 없습니다.", accId);
            return List.of();
        }

        return rooms.stream()
                .map(RoomListResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
    // 객실 상세 조회
    @Override
    public RoomResponseDTO getRoomDetail(String roomId) {
        /*Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 객실입니다."));

        log.info("[USER] 객실 상세 조회 완료 - roomId: {}", roomId);
        return RoomResponseDTO.fromEntity(room);*/
        return null;
    }
}
