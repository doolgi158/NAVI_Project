package com.navi.room.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.navi.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/* ============================================================
   [RoomStock]
   - 객실(Room)별 일자 단위 재고 관리 테이블
   - 항상 "오늘 ~ +30일" 범위의 재고만 유지 (Rolling Window)
   - 예약 시 재고 차감 / 취소 시 재고 복구
   ============================================================ */

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "NAVI_ROOM_STOCK",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_ROOM_DATE", columnNames = {"room_no", "stock_date"})
        },
        indexes = {
                @Index(name = "IDX_ROOM_STOCK_DATE", columnList = "stock_date")
        }
)
@SequenceGenerator(
        name = "room_stock_generator",
        sequenceName = "ROOM_STOCK_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class RoomStock extends BaseEntity {
    /* === COLUMN 정의 === */
    @Id @Column(name = "stock_no")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "room_stock_generator")
    private Long stockNo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_no", nullable = false)
    @JsonBackReference
    private Room room;

    @JsonManagedReference // ✅ RoomStock → RoomRsv (자식)
    @OneToMany(mappedBy = "roomStock", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomRsv> roomReservations = new ArrayList<>();


    // 재고 일자
    @Column(name = "stock_date", nullable = false)
    private LocalDate stockDate;

    // 남은 수량
    @Column(name = "remain_count", nullable = false)
    private Integer remainCount;

    // 판매 가능 여부
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable;

    /* 낙관적 락 (동시 결제/예약 충돌 방지) */
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @PrePersist
    private void prePersist() {
        if (this.isAvailable == null) this.isAvailable = true;
        if (this.remainCount == null && this.room != null)
            this.remainCount = this.room.getRoomCnt();
    }

    // 예약 발생 시 재고 차감
    public void decreaseStock(int count) {
        if (count <= 0) {
            throw new IllegalArgumentException("차감 수량은 0보다 커야 합니다.");
        }
        if (remainCount < count) {
            throw new IllegalStateException("재고가 부족합니다. (남은 수량: " + remainCount + ")");
        }

        this.remainCount -= count;
        if (this.remainCount == 0) {
            this.isAvailable = false;
        }
    }

    // 예약 취소 시 재고 복구
    public void increaseStock(int count) {
        if (count <= 0)
            throw new IllegalArgumentException("복구 수량은 0보다 커야 합니다.");

        int maxStock = this.room.getRoomCnt();
        if (this.remainCount + count > maxStock)
            throw new IllegalStateException("복구 후 재고가 최대 수량을 초과합니다.");

        this.remainCount += count;
        if (this.remainCount > 0)
            this.isAvailable = true;
    }

    // 재고 초기화용 (재고 수동 리셋 등)
    public void resetStock() {
        this.remainCount = this.room.getRoomCnt();
        this.isAvailable = true;
    }
}
