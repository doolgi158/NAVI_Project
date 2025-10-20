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
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomRsvServiceImpl implements RoomRsvService {

    private final RoomRsvRepository roomRsvRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final StockService stockService;  // ✅ 재고 관리 전담 서비스

    /* ============================================================
       ✅ [1] 단일 예약 생성 (결제 전)
       - StockService 통해 재고 차감
    ============================================================ */
    @Override
    @Transactional
    public RoomRsvResponseDTO createRoomReservation(RoomRsvRequestDTO dto) {
        User user = userRepository.findById(dto.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Room room = roomRepository.findByRoomId(dto.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("객실 정보를 찾을 수 없습니다."));

        // ✅ 재고 차감
        stockService.decreaseStock(room, dto.getStockDate(), dto.getStockDate().plusDays(1), dto.getQuantity());

        // ✅ 예약 엔티티 생성
        RoomRsv rsv = RoomRsv.builder()
                .roomRsvId(dto.getReserveId())
                .user(user)
                .room(room)
                .roomStock(null) // StockService가 차감 처리하므로 직접 참조 불필요
                .stockDate(dto.getStockDate())
                .quantity(dto.getQuantity())
//                .price(dto.getPrice())
                .rsvStatus(RsvStatus.PENDING)
                .build();

        roomRsvRepository.save(rsv);

        log.info("✅ 예약 생성 완료 → reserveId={}, user={}, room={}, date={}",
                dto.getReserveId(), user.getId(), room.getRoomId(), dto.getStockDate());

        return RoomRsvResponseDTO.fromEntity(rsv);
    }

    /* ============================================================
       ✅ [2] 다중 예약 생성 (한 예약 ID에 여러 객실)
    ============================================================ */
    @Override
    @Transactional
    public void createMultipleRoomReservations(String reserveId, Long userNo, List<RoomRsvRequestDTO> roomList) {
        log.info("[RoomRsvService] 다중 객실 예약 생성 시작 → reserveId={}, count={}", reserveId, roomList.size());
        for (RoomRsvRequestDTO dto : roomList) {
            dto.setReserveId(reserveId);
            dto.setUserNo(userNo);
            createRoomReservation(dto);
        }
        log.info("[RoomRsvService] 다중 객실 예약 생성 완료 - {}", reserveId);
    }

    /* ============================================================
       ✅ [3] 예약 상태 변경 + 재고 복구 (FAILED / CANCELLED / REFUNDED)
    ============================================================ */
    @Override
    @Transactional
    public void updateStatus(String reserveId, String status) {
        RsvStatus newStatus = RsvStatus.valueOf(status.toUpperCase());
        List<RoomRsv> rsvList = roomRsvRepository.findAllByRoomRsvId(reserveId);

        if (rsvList.isEmpty()) {
            throw new IllegalArgumentException("해당 예약 ID에 대한 정보가 없습니다.");
        }

        for (RoomRsv rsv : rsvList) {
            // ✅ 상태 변경
            switch (newStatus) {
                case PAID -> rsv.markPaid();
                case CANCELLED -> rsv.markCancelled();
                case FAILED -> rsv.markFailed();
                case REFUNDED -> rsv.markRefunded();
                case COMPLETED -> rsv.markCompleted();
                default -> throw new IllegalStateException("지원하지 않는 예약 상태: " + newStatus);
            }

            // ✅ 결제 실패, 취소, 환불 시 재고 복구
            if (newStatus == RsvStatus.FAILED ||
                    newStatus == RsvStatus.CANCELLED ||
                    newStatus == RsvStatus.REFUNDED) {

                Room room = rsv.getRoom();
                LocalDate date = rsv.getStockDate();
                int qty = rsv.getQuantity();

                stockService.increaseStock(room, date, date.plusDays(1), qty);

                log.info("🔁 재고 복구 완료 → room={}, date={}, qty={}",
                        room.getRoomId(), date, qty);
            }
        }

        log.info("🌀 예약 상태 변경 완료 → {} (reserveId={})", newStatus, reserveId);
    }

    /* ============================================================
       ✅ [4] 결제 검증용: 총 결제 금액 합산
    ============================================================ */
    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalAmountByReserveId(String reserveId) {
        BigDecimal total = roomRsvRepository.sumTotalAmountByRoomRsvId(reserveId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verifyTotalAmount(String reserveId, int paidAmount) {
        BigDecimal expected = getTotalAmountByReserveId(reserveId);
        boolean valid = expected.compareTo(BigDecimal.valueOf(paidAmount)) == 0;

        log.info("💰 결제 금액 검증 → reserveId={}, expected={}, paid={}, result={}",
                reserveId, expected, paidAmount, valid ? "✅ 일치" : "❌ 불일치");
        return valid;
    }

    /* ============================================================
       ✅ [5] 조회 기능
    ============================================================ */
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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));
        return roomRsvRepository.findAllByUserNo(user.getNo()).stream()
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
