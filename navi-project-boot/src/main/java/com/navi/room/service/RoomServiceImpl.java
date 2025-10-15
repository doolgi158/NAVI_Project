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

import java.time.DayOfWeek;
import java.time.LocalDate;
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
    // 1. 객실 생성
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

    // 2. 객실 수정
    @Override
    public RoomResponseDTO updateRoom(Long roomNo, RoomRequestDTO dto) {
        Room room = roomRepository.findById(roomNo)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 객실입니다."));

        room.changeFromRequestDTO(dto);
        Room updated = roomRepository.save(room);

        log.info("[ADMIN] 객실 정보 수정 완료 → {} ({})", updated.getRoomName(), updated.getAcc().getTitle());
        return RoomResponseDTO.fromEntity(updated);
    }

    // 3. 객실 조회
    @Override
    public List<RoomResponseDTO> getRooms(String accId) {
        Acc acc = accRepository.findByAccId(accId)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));

        List<Room> rooms = roomRepository.findByAcc_AccId(accId);
        return rooms.stream()
                .map(RoomResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // 4. 객실 삭제
    @Override
    public void deleteRoom(Long roomNo) {
        Room room = roomRepository.findById(roomNo)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 객실입니다."));

        roomRepository.delete(room);
        log.info("[ADMIN] 객실 삭제 완료 → {} ({})", room.getRoomName(), room.getAcc().getTitle());
    }

    /* 사용자 전용 */
    // 1. 숙소별 객실 리스트 조회
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
    // 2. 객실 상세 조회
    @Override
    public RoomResponseDTO getRoomDetail(String roomId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 객실입니다."));

        log.info("[USER] 객실 상세 조회 완료 - roomId: {}", roomId);
        return RoomResponseDTO.fromEntity(room);
    }

    /* 추가 비즈니스 로직 */
    // 1. 숙소별 최저 숙박 요금 계산
    @Transactional(readOnly = true)
    public Integer findMinPriceByAcc(Acc acc, LocalDate checkIn, LocalDate checkOut) {
        List<Room> rooms = roomRepository.findByAcc(acc);

        if (rooms.isEmpty()) return null;

        return rooms.stream()
                .map(room -> calculateStayPrice(room, checkIn, checkOut))
                .min(Integer::compareTo)
                .orElse(null);
    }

    // 2. 숙박 요금 계산
    @Transactional(readOnly = true)
    public int calculateStayPrice(Room room, LocalDate checkIn, LocalDate checkOut) {
        int total = 0;
        LocalDate startDate = checkIn;

        // .isAfter() : 날짜 비교 메서드
        while (!startDate.isAfter(checkOut.minusDays(1))) {
            DayOfWeek day = startDate.getDayOfWeek();       // .getDayOfWeek() : 요일을 반환하는 메서드
            boolean isWeekend = (day == DayOfWeek.FRIDAY
                    || day == DayOfWeek.SATURDAY
                    || day == DayOfWeek.SUNDAY);

            total += isWeekend ? room.getWeekendFee() : room.getWeekdayFee();
            startDate = startDate.plusDays(1);
        }

        return total;
    }
}
