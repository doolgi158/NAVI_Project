package com.navi.room.service;

import com.navi.room.domain.Room;
import com.navi.room.domain.RoomStock;
import com.navi.room.dto.response.StockResponseDTO;
import com.navi.room.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class StockServiceImpl implements StockService {
    private final StockRepository stockRepository;

    /* 객실별 기간 내 재고 조회  */
    @Override
    @Transactional(readOnly = true)
    public List<StockResponseDTO> getStockByRoomAndPeriod(String roomId, LocalDate startDate, LocalDate endDate) {
        log.debug("🧾 재고 조회 요청 - roomId={}, start={}, end={}", roomId, startDate, endDate);

        List<RoomStock> stocks = stockRepository.findByRoom_RoomIdAndStockDateBetween(roomId, startDate, endDate.minusDays(1));

        return stocks.stream()
                .map(stock -> StockResponseDTO.builder()
                        .stockNo(stock.getStockNo())
                        .roomNo(stock.getRoom().getRoomNo())
                        .roomId(stock.getRoom().getRoomId())
                        .roomName(stock.getRoom().getRoomName())
                        .stockDate(stock.getStockDate())
                        .remainCount(stock.getRemainCount())
                        .isAvailable(stock.getIsAvailable())
                        .build())
                .collect(Collectors.toList());
    }

    /* ============================================================
       ✅ 2️⃣ 특정 기간 내 최소 잔여 객실 수 조회
    ============================================================ */
    @Override
    @Transactional(readOnly = true)
    public int getRemainCount(String roomId, LocalDate checkIn, LocalDate checkOut) {
        List<RoomStock> stocks = stockRepository.findByRoom_RoomIdAndStockDateBetween(
                roomId, checkIn, checkOut.minusDays(1)
        );

        if (stocks.isEmpty()) {
            log.warn("⚠️ 재고 없음 - roomId={}, 기간: {}~{}", roomId, checkIn, checkOut);
            return 0;
        }

        int minRemain = stocks.stream()
                .mapToInt(RoomStock::getRemainCount)
                .min()
                .orElse(0);

        log.debug("🔹 roomId={} → 최소 잔여 수량: {}", roomId, minRemain);
        return minRemain;
    }

    /* ============================================================
       ✅ 3️⃣ 예약 가능 여부 확인 (모든 일자 재고 충분 여부)
    ============================================================ */
    @Override
    @Transactional(readOnly = true)
    public boolean hasAvailableStock(String roomId, LocalDate checkIn, LocalDate checkOut, Integer roomCount) {
        List<RoomStock> stocks = stockRepository.findByRoom_RoomIdAndStockDateBetween(
                roomId, checkIn, checkOut.minusDays(1)
        );

        if (stocks.isEmpty()) {
            log.warn("❌ 재고 데이터 없음 - roomId={}", roomId);
            return false;
        }

        boolean available = stocks.stream()
                .allMatch(s -> Boolean.TRUE.equals(s.getIsAvailable()) && s.getRemainCount() >= roomCount);

        log.info("🔍 재고 확인 - roomId={}, 가능 여부={}, 요청수량={}", roomId, available, roomCount);
        return available;
    }

    /* ============================================================
       ✅ 4️⃣ 예약 발생 시 재고 차감 (기간 단위)
    ============================================================ */
    @Override
    public void decreaseStock(Room room, LocalDate startDate, LocalDate endDate, int qty) {
        log.info("📉 [재고 차감 요청] room={}, 기간:{}~{}, 수량={}", room.getRoomId(), startDate, endDate, qty);

        if (qty <= 0) throw new IllegalArgumentException("❌ 예약 수량은 1개 이상이어야 합니다.");

        LocalDate date = startDate;
        while (date.isBefore(endDate)) {
            RoomStock stock = stockRepository.findByRoomAndStockDate(room, date)
                    .orElse(null);

            if (stock == null) {
                stock = createIfMissing(room, date);
            }

            if (stock.getRemainCount() < qty) {
                throw new IllegalStateException(String.format(
                        "❌ 재고 부족: room=%s, date=%s (남은 %d개, 요청 %d개)",
                        room.getRoomId(), date, stock.getRemainCount(), qty
                ));
            }

            stock.decreaseStock(qty);
            stockRepository.save(stock);

            log.debug("✅ [{}] 재고 차감 완료 → 남은 수량: {}", date, stock.getRemainCount());
            date = date.plusDays(1);
        }
    }


    /* ============================================================
       ✅ 5️⃣ 예약 취소 / 실패 시 재고 복구 (기간 단위)
    ============================================================ */
    @Override
    public void increaseStock(Room room, LocalDate startDate, LocalDate endDate, int qty) {
        log.info("📈 [재고 복구 요청] room={}, 기간:{}~{}, 수량={}", room.getRoomId(), startDate, endDate, qty);

        if (qty <= 0) throw new IllegalArgumentException("❌ 복구 수량은 1개 이상이어야 합니다.");
        if (!endDate.isAfter(startDate)) throw new IllegalArgumentException("❌ 체크아웃 날짜가 체크인보다 이전입니다.");

        LocalDate date = startDate;
        while (date.isBefore(endDate)) {
            RoomStock stock = stockRepository.findByRoomAndStockDate(room, date)
                    .orElse(null);

            if (stock == null) {
                // ✅ 재고가 없을 경우 새로 생성
                stock = createIfMissing(room, date);
            }

            stock.increaseStock(qty);
            stockRepository.save(stock);

            log.debug("♻️ [{}] 재고 복구 완료 → 남은 수량: {}", date, stock.getRemainCount());
            date = date.plusDays(1);
        }
    }


    /* ============================================================
       ✅ 6️⃣ 재고 자동 생성 (하이브리드)
    ============================================================ */
    @Override
    public RoomStock createIfMissing(Room room, LocalDate stockDate) {
        return stockRepository.findByRoomAndStockDate(room, stockDate)
                .orElseGet(() -> {
                    RoomStock newStock = RoomStock.builder()
                            .room(room)
                            .stockDate(stockDate)
                            .remainCount(room.getRoomCnt() != null ? room.getRoomCnt() : 1)
                            .isAvailable(true)
                            .build();
                    RoomStock saved = stockRepository.save(newStock);
                    log.info("🆕 신규 재고 생성 → room={}, date={}, 초기 수량={}",
                            room.getRoomId(), stockDate, saved.getRemainCount());
                    return saved;
                });
    }
}
