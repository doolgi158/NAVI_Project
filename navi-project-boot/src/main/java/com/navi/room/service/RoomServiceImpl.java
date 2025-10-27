package com.navi.room.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.repository.AccRepository;
import com.navi.room.domain.Room;
import com.navi.room.domain.RoomStock;
import com.navi.room.dto.api.RoomApiDTO;
import com.navi.room.dto.request.RoomRequestDTO;
import com.navi.room.dto.response.RoomListResponseDTO;
import com.navi.room.dto.response.RoomResponseDTO;
import com.navi.room.repository.RoomRepository;
import com.navi.room.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class RoomServiceImpl implements RoomService {
    private final AccRepository accRepository;
    private final RoomRepository roomRepository;
    private final StockRepository stockRepository;
    private final StockService stockService;

    /* 관리자 전용 CRUD  */
    @Override
    public RoomResponseDTO createRoom(RoomRequestDTO dto) {
        Acc acc = accRepository.findById(dto.getAccNo())
                .orElseThrow(() -> new IllegalArgumentException("해당 숙소가 존재하지 않습니다. accNo=" + dto.getAccNo()));

        Long nextSeq = roomRepository.getNextSeqVal();
        String roomId = String.format("ROM%04d", nextSeq);

        Room room = Room.builder()
                .acc(acc)
                .roomNo(nextSeq)
                .roomId(roomId)
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
        initializeRoomStock(saved);

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
    public List<RoomApiDTO> getRoomListByAcc(Long accNo, String keyword) {
        Acc acc = accRepository.findById(accNo)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));

        List<Room> rooms = roomRepository.findByAcc(acc);

        if (keyword != null && !keyword.isBlank()) {
            rooms = rooms.stream()
                    .filter(r -> r.getRoomName().toLowerCase().contains(keyword.toLowerCase()))
                    .toList();
        }

        return rooms.stream()
                .map(RoomApiDTO::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponseDTO getRooms(Long roomNo) {
        log.info("🔍 객실 상세 조회 요청 - roomNo={}", roomNo);

        Room room = roomRepository.findById(roomNo)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 객실입니다."));

        return RoomResponseDTO.of(room);
    }

    @Override
    public void deleteRoom(Long roomNo) {
        Room room = roomRepository.findById(roomNo)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 객실입니다."));
        roomRepository.delete(room);
        log.info("[ADMIN] 객실 삭제 완료 → {} ({})", room.getRoomName(), room.getAcc().getTitle());
    }

    @Override
    public void initializeRoomStock(Room room) {
        LocalDate today = LocalDate.now();
        for (int i = 0; i < 30; i++) {
            RoomStock stock = RoomStock.builder()
                    .room(room)
                    .stockDate(today.plusDays(i))
                    .remainCount(room.getRoomCnt())
                    .isAvailable(true)
                    .version(0L)
                    .build();
            stockRepository.save(stock);
        }
    }

    @Override
    public List<RoomResponseDTO> getRoomsByAcc(Long accNo) {
        Acc acc = accRepository.findById(accNo)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));

        List<Room> rooms = roomRepository.findByAcc(acc);

        return rooms.stream()
                .map(RoomResponseDTO::fromEntity)
                .toList();
    }

    /* 사용자 전용 - 객실 리스트 / 조건 검색  */
    @Override
    public List<RoomListResponseDTO> getRoomList(String accId) {
        Acc acc = accRepository.findByAccId(accId)
                .orElseThrow(() -> new IllegalArgumentException("숙소를 찾을 수 없습니다."));

        List<Room> rooms = roomRepository.findByAcc(acc);

        if (rooms.isEmpty()) {
            log.warn("[USER] 숙소({})에 객실이 없습니다.", accId);
            return List.of();
        }

        return rooms.stream()
                .map(room -> RoomListResponseDTO.fromEntity(room, null))
                .toList();
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
        Acc acc = accRepository.findByAccId(accId)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));
        log.info("[DEBUG] accId={}, accNo={}", acc.getAccId(), acc.getAccNo());

        List<Room> allRooms = roomRepository.findByAcc(acc);
        log.info("[DEBUG] 조회된 객실 수 = {}", allRooms.size());
        for (Room r : allRooms) {
            log.info("[DEBUG] Room({}) accNo={} accId={}", r.getRoomName(),
                    r.getAcc().getAccNo(), r.getAcc().getAccId());
        }

        if (allRooms.isEmpty()) {
            log.warn("[USER] 숙소({})에 객실이 없습니다.", accId);
            return List.of();
        }

        // 3️날짜 없으면 전체 반환
        if (checkIn == null || checkOut == null) {
            log.info("[USER] 날짜 미선택 → 전체 객실 반환");
            return allRooms.stream()
                    .map(room -> RoomListResponseDTO.fromEntity(room, null))
                    .toList();
        }

        // 4️재고 확인
        List<RoomListResponseDTO> availableRooms = allRooms.stream()
                .filter(room -> stockService.hasAvailableStock(room.getRoomId(), checkIn, checkOut, roomCount))
                .filter(room -> guestCount == null || room.getMaxCnt() >= guestCount)
                .map(room -> {
                    int remain = stockService.getRemainCount(room.getRoomId(), checkIn, checkOut);
                    return RoomListResponseDTO.fromEntity(room, remain);
                })
                .toList();

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