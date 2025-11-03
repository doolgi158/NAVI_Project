package com.navi.room.service;

import com.navi.accommodation.domain.Acc;
import com.navi.common.enums.RsvStatus;
import com.navi.room.domain.Room;
import com.navi.room.domain.RoomRsv;
import com.navi.room.dto.request.RoomRsvRequestDTO;
import com.navi.room.dto.response.RoomPreRsvResponseDTO;
import com.navi.room.dto.response.RoomRsvResponseDTO;
import com.navi.room.mapper.RoomRsvMapper;
import com.navi.room.repository.RoomRepository;
import com.navi.room.repository.RoomRsvRepository;
import com.navi.user.domain.User;
import com.navi.user.dto.auth.UserSecurityDTO;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomRsvServiceImpl implements RoomRsvService {
    private final RoomRsvRepository roomRsvRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final StockService stockService;

    private final RoomRsvMapper roomRsvMapper;

    /* 단일 객실 예약 생성 (결제 전) */
    @Override
    @Transactional
    public RoomPreRsvResponseDTO createRoomReservation(RoomRsvRequestDTO dto) {
        // 로그인 사용자 가져오기 (SecurityContextHolder 사용)
        User user = getLoginUser();

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
        int serverNights = Math.toIntExact(ChronoUnit.DAYS.between(start, end));
        if (!Objects.equals(serverNights, dto.getNights())) {
            log.warn("⚠️ 숙박일수 불일치 (client={}, server={}) → 재계산 적용", dto.getNights(), serverNights);
        }

        // TODO: 객실 단가 (평일요금 기준)
        BigDecimal unitFee = room.getWeekdayFee() != null
                ? BigDecimal.valueOf(room.getWeekdayFee())
                : BigDecimal.ZERO;

        // 총액 계산
        BigDecimal totalPrice = unitFee
                .multiply(BigDecimal.valueOf(serverNights))
                .multiply(BigDecimal.valueOf(dto.getQuantity()));

        // 재고 생성/차감 (체크인 ~ 체크아웃)
        stockService.decreaseStock(room, start, end, dto.getQuantity());

        // 예약 ID 생성 (다중 예약 시 있으면 그대로 사용)
        String reserveId = dto.getReserveId();
        if (reserveId == null || reserveId.isBlank()) {
            reserveId = generateReserveId();
        }

        // 예약 엔티티 생성
        RoomRsv rsv = RoomRsv.builder()
                .reserveId(reserveId)
                .user(user)
                .room(room)
                .quantity(dto.getQuantity())
                .price(unitFee)
                .startDate(start)
                .endDate(end)
                .nights(serverNights)
                .rsvStatus(RsvStatus.PENDING)
                .guestCount(dto.getGuestCount())
                .totalPrice(totalPrice)
                .build();

        roomRsvRepository.save(rsv);

        log.info("✅ 객실 예약 생성 완료 → reserveId={}, user={}, room={}, stay={}~{}, qty={}, nights={}, total={}",
                reserveId, user.getNo(), room.getRoomId(), start, end, dto.getQuantity(), serverNights, totalPrice);

        return RoomPreRsvResponseDTO.builder()
                .success(true)
                .reserveId(reserveId)
                .message("✅ 객실 임시 예약 생성 완료")
                .build();
    }

    /* 다중 객실 예약 (한 예약 ID에 여러 객실) */
    @Override
    @Transactional
    public RoomPreRsvResponseDTO createMultipleRoomReservations(List<RoomRsvRequestDTO> roomList) {
        log.info("[RoomRsvService] 다중 객실 예약 생성 시작 → count={}", roomList.size());

        if (roomList.isEmpty()) {
            throw new IllegalArgumentException("요청 데이터가 비어있습니다.");
        }

        // 예약 ID 한번만 생성
        String reserveId = generateReserveId();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // 각 객실 예약 생성
        for (RoomRsvRequestDTO dto : roomList) {
            dto.setReserveId(reserveId);
            RoomPreRsvResponseDTO result = createRoomReservation(dto); // 단일 생성 재사용
        }

        return RoomPreRsvResponseDTO.builder()
                .success(true)
                .reserveId(reserveId)
                .message("✅ 다중 객실 임시 예약 생성 완료")
                .build();
    }

    @Override
    @Transactional
    public void updateReserverInfo(String reserveId, String name, String tel, String email, String birth) {
        List<RoomRsv> rsvList = roomRsvRepository.findAllByReserveId(reserveId);
        if (rsvList.isEmpty()) throw new IllegalArgumentException("❌ 예약 정보를 찾을 수 없습니다.");

        for (RoomRsv rsv : rsvList) {
            rsv.updateReserverInfo(name, tel, email, birth);
        }

        log.info("🪪 예약자 정보 업데이트 완료 → reserveId={}, name={}, tel={}, email={}, birth={}",
                reserveId, name, tel, email, birth);
    }

    /* 예약 상태 변경 + 재고 복구 */
    @Override
    @Transactional
    public void updateStatus(String reserveId, String status) {
        RsvStatus newStatus = RsvStatus.valueOf(status.toUpperCase());
        List<RoomRsv> rsvList = roomRsvRepository.findAllByReserveId(reserveId);

        if (rsvList.isEmpty()) throw new IllegalArgumentException("해당 예약 ID에 대한 정보가 없습니다.");

        for (RoomRsv rsv : rsvList) {
            switch (newStatus) {
                case PAID -> rsv.markPaid();
                case CANCELLED -> rsv.markCancelled();
                case FAILED -> rsv.markFailed();
                case REFUNDED -> rsv.markRefunded();
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
        BigDecimal total = roomRsvRepository.sumTotalAmountByReserveId(reserveId);
        return total != null ? total : BigDecimal.ZERO;
    }

    // 관리자용 객실 예약 목록 조회
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getAdminReservationList(int page, int size, String status, String keyword) {
        log.info("📋 [ADMIN] 객실 예약 목록 조회 - page={}, size={}, status={}, keyword={}",
                page, size, status, keyword);

        int offset = (page - 1) * size;

        List<RoomRsvResponseDTO> list = roomRsvMapper.selectAdminRoomRsvList(
                offset, size, status, keyword, "RSV_STATUS", "ASC"
        );

        int total = roomRsvMapper.countAdminRoomRsvList(status, keyword);

        Map<String, Object> result = new HashMap<>();
        result.put("data", list);
        result.put("total", total);

        return result;
    }

    /* 예약 상태 조회 */
    @Override
    public String getReservationStatus(String reserveId) {
        return roomRsvRepository.findStatusByReserveId(reserveId)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
    }

    /* 예약 삭제 */
    @Transactional
    public void deleteReservationByReserveId(String reserveId) {
        RoomRsv rsv = roomRsvRepository.findByReserveId(reserveId)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다."));
        if (rsv.getRsvStatus() != RsvStatus.CANCELLED) {
            throw new IllegalStateException("예약 취소 상태일 때만 삭제할 수 있습니다.");
        }
        roomRsvRepository.deleteById(rsv.getNo());
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

    @Override
    @Transactional(readOnly = true)
    public List<RoomRsvResponseDTO> findAllByUserId(String userId) {
        // 1. 유저 조회
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("❌ 사용자 정보를 찾을 수 없습니다."));

        // 2. 예약 목록 조회
        List<RoomRsv> list = roomRsvRepository.findAllByUserNo(user.getNo());

        // 3. DTO 변환 (숙소명 + 객실명 포함)
        return list.stream()
                .map(r -> {
                    Room room = r.getRoom();
                    Acc acc = room.getAcc();

                    return RoomRsvResponseDTO.builder()
                            .reserveId(r.getReserveId())
                            .startDate(r.getStartDate())
                            .endDate(r.getEndDate())
                            .guestCount(r.getGuestCount())
                            .price(r.getPrice())
                            .rsvStatus(r.getRsvStatus())
                            .quantity(r.getQuantity())
                            .title(acc != null ? acc.getTitle() : null)
                            .roomName(room != null ? room.getRoomName() : null)
                            .reserverName(user.getName())
                            .reserverEmail(user.getEmail())
                            .reserverTel(user.getPhone())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomRsvResponseDTO findByReserveId(String reserveId) {
        RoomRsv rsv = roomRsvRepository.findByReserveId(reserveId)
                .orElseThrow(() -> new IllegalArgumentException("예약 정보를 찾을 수 없습니다."));
        return RoomRsvResponseDTO.fromEntity(rsv);
    }

    /* === 공통 유틸 메서드 === */
    /* 로그인 사용자 조회 */
    private User getLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("로그인이 필요한 서비스입니다.");
        }

        UserSecurityDTO loginUser = (UserSecurityDTO) authentication.getPrincipal();

        return userRepository.findByNo(loginUser.getNo())
                .orElseThrow(() -> new IllegalArgumentException("❌ 사용자 정보를 찾을 수 없습니다."));
    }

    /* 예약 ID 생성 (예: 20251025ACC0001) */
    private String generateReserveId() {
        String today = LocalDate.now(ZoneId.of("Asia/Seoul"))
                .format(DateTimeFormatter.BASIC_ISO_DATE);
        Long seq = roomRsvRepository.getNextSeqVal();
        return String.format("%sACC%04d", today, seq);
    }
}
