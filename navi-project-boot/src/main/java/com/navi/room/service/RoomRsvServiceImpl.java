package com.navi.room.service;

import com.navi.common.enums.RsvStatus;
import com.navi.room.domain.Room;
import com.navi.room.domain.RoomRsv;
import com.navi.room.dto.request.RoomRsvRequestDTO;
import com.navi.room.dto.response.RoomRsvResponseDTO;
import com.navi.room.repository.RoomRepository;
import com.navi.room.repository.RoomRsvRepository;
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomRsvServiceImpl implements RoomRsvService {

    private final RoomRsvRepository roomRsvRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final StockService stockService;

    /* 단일 객실 예약 생성 (결제 전) */
    @Override
    @Transactional
    public RoomRsvResponseDTO createRoomReservation(RoomRsvRequestDTO dto) {
        // 사용자 처리 (임시 userNo)
        Long userNo = dto.getUserNo() != null ? dto.getUserNo() : 1L;
        User user = userRepository.findById(userNo)
                .orElseThrow(() -> new IllegalArgumentException("❌ 사용자를 찾을 수 없습니다."));

        // 객실 조회
        Room room = roomRepository.findByRoomId(dto.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("❌ 객실 정보를 찾을 수 없습니다."));

        // 날짜 검증
        LocalDate start = dto.getStartDate();
        LocalDate end = dto.getEndDate();

        if (start == null || end == null || !end.isAfter(start)) {
            throw new IllegalArgumentException("❌ 숙박 기간이 유효하지 않습니다.");
        }

        // 숙박일수 계산
        int nights = Math.toIntExact(ChronoUnit.DAYS.between(start, end));
        if (nights <= 0) {
            throw new IllegalArgumentException("❌ 숙박일수는 최소 1일 이상이어야 합니다.");
        }

        // TODO: 객실 단가 (평일요금 기준)
        BigDecimal unitFee = room.getWeekdayFee() != null
                ? BigDecimal.valueOf(room.getWeekdayFee())
                : BigDecimal.ZERO;

        // 총액 계산
        BigDecimal totalPrice = unitFee
                .multiply(BigDecimal.valueOf(nights))
                .multiply(BigDecimal.valueOf(dto.getQuantity()));

        // 재고 차감 (start ~ end-1)
        stockService.decreaseStock(room, start, end, dto.getQuantity());

        // 예약 ID 생성 (예: 20251020ACC0001)
        String today = LocalDate.now(ZoneId.of("Asia/Seoul"))
                .format(DateTimeFormatter.BASIC_ISO_DATE);
        long seq = roomRsvRepository.count() + 1;
        String reserveId = String.format("%sACC%04d", today, seq);

        // 예약 엔티티 생성
        RoomRsv rsv = RoomRsv.builder()
                .roomRsvId(reserveId)
                .user(user)
                .room(room)
                .quantity(dto.getQuantity())
                .price(unitFee)
                .startDate(start)
                .endDate(end)
                .nights(nights)
                .rsvStatus(RsvStatus.PENDING)
                .build();

        roomRsvRepository.save(rsv);

        log.info("✅ 객실 예약 생성 완료 → reserveId={}, user={}, room={}, stay={}~{}, qty={}, nights={}, total={}",
                reserveId, user.getNo(), room.getRoomId(), start, end, dto.getQuantity(), nights, totalPrice);

        return RoomRsvResponseDTO.fromEntity(rsv);
    }

    /* 다중 객실 예약 (한 예약 ID에 여러 객실) */
    @Override
    @Transactional
    public void createMultipleRoomReservations(String reserveId, Long userNo, List<RoomRsvRequestDTO> roomList) {
        log.info("[RoomRsvService] 다중 객실 예약 생성 시작 → user={}, count={}", userNo, roomList.size());

        for (RoomRsvRequestDTO dto : roomList) {
            dto.setUserNo(userNo);
            dto.setReserveId(reserveId); // 동일 예약 ID 공유
            createRoomReservation(dto);
        }

        log.info("[RoomRsvService] 다중 객실 예약 생성 완료 → user={}, total={}", userNo, roomList.size());
    }

    /* 예약 상태 변경 + 재고 복구 */
    @Override
    @Transactional
    public void updateStatus(String reserveId, String status) {
        RsvStatus newStatus = RsvStatus.valueOf(status.toUpperCase());
        List<RoomRsv> rsvList = roomRsvRepository.findAllByRoomRsvId(reserveId);

        if (rsvList.isEmpty()) throw new IllegalArgumentException("해당 예약 ID에 대한 정보가 없습니다.");

        for (RoomRsv rsv : rsvList) {
            switch (newStatus) {
                case PAID -> rsv.markPaid();
                case CANCELLED -> rsv.markCancelled();
                case FAILED -> rsv.markFailed();
                case REFUNDED -> rsv.markRefunded();
                case COMPLETED -> rsv.markCompleted();
            }

            if (newStatus == RsvStatus.FAILED ||
                    newStatus == RsvStatus.CANCELLED ||
                    newStatus == RsvStatus.REFUNDED) {
                stockService.increaseStock(rsv.getRoom(), rsv.getStartDate(), rsv.getEndDate(), rsv.getQuantity());
            }
        }

        log.info("🔁 예약 상태 변경 완료 → {} (reserveId={})", newStatus, reserveId);
    }

    /* 결제 검증용 금액 합산 */
    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalAmountByReserveId(String reserveId) {
        BigDecimal total = roomRsvRepository.sumTotalAmountByRoomRsvId(reserveId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verifyTotalAmount(String reserveId, BigDecimal paidAmount) {
        BigDecimal expected = getTotalAmountByReserveId(reserveId);
        boolean valid = expected.compareTo(paidAmount) == 0;

        log.info("💰 결제 금액 검증 → reserveId={}, expected={}, paid={}, result={}",
                reserveId, expected, paidAmount, valid ? "✅ 일치" : "❌ 불일치");
        return valid;
    }

    /* 조회 기능 */
    @Override
    @Transactional(readOnly = true)
    public List<RoomRsvResponseDTO> findAll() {
        return roomRsvRepository.findAll().stream()
                .map(RoomRsvResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomRsvResponseDTO> findAllByUserId(String userId) {
        // userId로 user 조회
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("❌ 사용자 정보를 찾을 수 없습니다."));

        // userNo로 예약 조회
        List<RoomRsv> list = roomRsvRepository.findAllByUserNo(user.getNo());

        return list.stream()
                .map(RoomRsvResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomRsvResponseDTO findByRoomRsvId(String roomRsvId) {
        RoomRsv rsv = roomRsvRepository.findByRoomRsvId(roomRsvId)
                .orElseThrow(() -> new IllegalArgumentException("예약 정보를 찾을 수 없습니다."));
        return RoomRsvResponseDTO.fromEntity(rsv);
    }
}
