package com.navi.room.service;

import com.navi.room.domain.Room;
import com.navi.room.domain.RoomStock;
import com.navi.room.dto.request.StockRequestDTO;
import com.navi.room.dto.response.StockResponseDTO;
import com.navi.room.repository.StockRepository;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class StockServiceImpl implements StockService {
    private final StockRepository stockRepository;

    // 특정 객실 ID 기준 기간별 재고 조회
    @Override
    @Transactional(readOnly = true)
    public List<StockResponseDTO> getStockByRoomAndPeriod(String roomId, LocalDate startDate, LocalDate endDate) {
        log.debug("재고 조회 요청 - roomId={}, start={}, end={}", roomId, startDate, endDate);

        List<RoomStock> stocks = stockRepository.findByRoom_RoomIdAndStockDateBetween(roomId, startDate, endDate);

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

    // 예약 발생 시 재고 차감
    // TODO: 낙관적 락 충돌 시 최대 3번까지 재시도
    @Override
    public void decreaseStock(Room room, LocalDate startDate, LocalDate endDate, int qty) {
        log.info("재고 차감 요청 - room={}, 기간:{}~{}, 수량={}", room.getRoomId(), startDate, endDate, qty);

        LocalDate date = startDate;
        while (!date.isAfter(endDate.minusDays(1))) {
            LocalDate targetDate = date; // 람다 참조용 final 변수

            RoomStock stock = stockRepository.findByRoomAndStockDate(room, targetDate)
                    .orElseGet(() -> createIfMissing(room, targetDate));

            stock.decreaseStock(qty);
            stockRepository.save(stock);

            log.debug("  [{}] 차감 후 남은 수량: {}", targetDate, stock.getRemainCount());
            date = date.plusDays(1);
        }
    }

    // 예약 취소 시 재고 복구
    @Override
    public void increaseStock(Room room, LocalDate startDate, LocalDate endDate, int qty) {
        log.info("재고 복구 요청 - room={}, 기간:{}~{}, 수량={}", room.getRoomId(), startDate, endDate, qty);

        LocalDate date = startDate;
        while (!date.isAfter(endDate.minusDays(1))) {
            LocalDate targetDate = date; // 람다 참조용 final 변수

            RoomStock stock = stockRepository.findByRoomAndStockDate(room, targetDate)
                    .orElseThrow(() -> new IllegalStateException("해당 날짜 재고 없음: " + targetDate));

            stock.increaseStock(qty);
            stockRepository.save(stock);

            log.debug("  [{}] 복구 후 수량: {}", targetDate, stock.getRemainCount());
            date = date.plusDays(1);
        }
    }

    // 특정 날짜 재고가 없을 경우 자동 생성
    @Override
    public RoomStock createIfMissing(Room room, LocalDate stockDate) {
        log.debug("재고 없음 → 신규 생성: roomId={}, stockDate={}", room.getRoomId(), stockDate);

        if (stockRepository.existsByRoomAndStockDate(room, stockDate)) {
            return stockRepository.findByRoomAndStockDate(room, stockDate).get();
        }

        RoomStock newStock = RoomStock.builder()
                .room(room)
                .stockDate(stockDate)
                .remainCount(room.getRoomCnt())
                .isAvailable(true)
                .build();

        RoomStock saved = stockRepository.save(newStock);
        log.info("신규 재고 생성 완료 - roomId={}, stockDate={}", room.getRoomId(), stockDate);
        return saved;
    }
}
