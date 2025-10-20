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

    private final AccRepository accRepository;
    private final RoomRepository roomRepository;
    private final StockService stockService;

    /* ============================================================
       ✅ 관리자 전용 CRUD
       ============================================================ */
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
        Room room = roomRepository.findById(roomNo)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 객실입니다."));

        room.changeFromRequestDTO(dto);
        Room updated = roomRepository.save(room);

        log.info("[ADMIN] 객실 수정 완료 → {} ({})", updated.getRoomName(), updated.getAcc().getTitle());
        return RoomResponseDTO.fromEntity(updated);
    }

    @Override
    public List<RoomResponseDTO> getRooms(String accId) {
        Acc acc = accRepository.findByAccId(accId)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));

        List<Room> rooms = roomRepository.findByAcc_AccId(accId);

        return rooms.stream()
                .map(RoomResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteRoom(Long roomNo) {
        Room room = roomRepository.findById(roomNo)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 객실입니다."));
        roomRepository.delete(room);
        log.info("[ADMIN] 객실 삭제 완료 → {} ({})", room.getRoomName(), room.getAcc().getTitle());
    }

    /* ============================================================
       ✅ 사용자 전용 - 객실 리스트 / 조건 검색
       ============================================================ */
    @Override
    public List<RoomListResponseDTO> getRoomList(String accId) {
        List<Room> rooms = roomRepository.findByAcc_AccId(accId);

        if (rooms.isEmpty()) {
            log.warn("[USER] 해당 숙소({})의 객실 정보가 없습니다.", accId);
            return List.of();
        }

        // ✅ remainCount를 null로 두면 (단순 전체 조회 시)
        return rooms.stream()
                .map(room -> RoomListResponseDTO.fromEntity(room, null))
                .collect(Collectors.toList());
    }

    @Override
    public RoomResponseDTO getRoomDetail(String roomId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 객실입니다."));

        log.info("[USER] 객실 상세 조회 완료 - roomId: {}", roomId);
        return RoomResponseDTO.fromEntity(room);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomListResponseDTO> getAvailableRooms(
            String accId,
            LocalDate checkIn,
            LocalDate checkOut,
            Integer guestCount,
            Integer roomCount
    ) {
        // 1️⃣ 숙소 존재 확인
        Acc acc = accRepository.findByAccId(accId)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));

        // 2️⃣ 숙소의 모든 객실 가져오기
        List<Room> allRooms = roomRepository.findByAcc_AccId(accId);

        if (allRooms.isEmpty()) {
            log.warn("[USER] 숙소({})에 객실이 없습니다.", accId);
            return List.of();
        }

        // 3️⃣ 날짜가 없으면 전체 반환
        if (checkIn == null || checkOut == null) {
            log.info("[USER] 날짜 미선택 → 전체 객실 반환");
            return allRooms.stream()
                    .map(room -> RoomListResponseDTO.fromEntity(room, null))
                    .collect(Collectors.toList());
        }

        // 4️⃣ 해당 날짜 범위에서 재고 확인 및 remainCount 계산
        List<RoomListResponseDTO> availableRooms = allRooms.stream()
                .filter(room -> stockService.hasAvailableStock(room.getRoomId(), checkIn, checkOut, roomCount))
                .filter(room -> guestCount == null || room.getMaxCnt() >= guestCount)
                .map(room -> {
                    int remain = stockService.getRemainCount(room.getRoomId(), checkIn, checkOut);
                    return RoomListResponseDTO.fromEntity(room, remain);
                })
                .collect(Collectors.toList());

        log.info("[USER] 숙소({})의 예약 가능 객실: {}개", accId, availableRooms.size());
        return availableRooms;
    }

    /* ============================================================
       ✅ 비즈니스 로직 - 요금 계산
       ============================================================ */
    @Override
    @Transactional(readOnly = true)
    public Integer findMinPriceByAcc(Acc acc, LocalDate checkIn, LocalDate checkOut) {
        List<Room> rooms = roomRepository.findByAcc(acc);

        if (rooms.isEmpty()) return null;

        return rooms.stream()
                .map(room -> calculateStayPrice(room, checkIn, checkOut))
                .min(Integer::compareTo)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public int calculateStayPrice(Room room, LocalDate checkIn, LocalDate checkOut) {
        int total = 0;
        LocalDate date = checkIn;

        while (!date.isAfter(checkOut.minusDays(1))) {
            DayOfWeek day = date.getDayOfWeek();
            boolean isWeekend = (day == DayOfWeek.FRIDAY || day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY);
            total += isWeekend ? room.getWeekendFee() : room.getWeekdayFee();
            date = date.plusDays(1);
        }
        return total;
    }
}
