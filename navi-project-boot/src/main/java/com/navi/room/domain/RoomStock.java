package com.navi.room.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.navi.common.entity.BaseEntity;
import com.navi.room.dto.request.StockRequestDTO;
import jakarta.persistence.*;
import lombok.*;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "NAVI_ROOM_STOCK")
@SequenceGenerator(
        name = "room_stock_generator",
        sequenceName = "ROOM_STOCK_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class RoomStock extends BaseEntity {
    /* === COLUMN 정의 === */
    // 내부 식별번호 (예: 1)
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "room_stock_generator")
    @Column(name = "stock_no")
    private Long stockNo;

    /* === 연관관계 설정 === */
    // 객실 ID (예: ROM001), 기본 판매 가능 수량 (예: 5)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_no", nullable = false)
    @JsonBackReference
    private Room room;

    // 날짜별 (예: 2025-10-15)
    @Id @Column(name = "stock_date", nullable = false)
    private LocalDate stockDate;

    // 현재 남은 수량 (예: 3)
    @Column(name = "remain_count", nullable = false)
    private Integer remainCount;

    // 재고 상태
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable;

    // 낙관적 락 버전 (동시성 제어)
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    // created_at, updated_at은 BaseEntity가 자동 관리

    @PrePersist
    private void prePersist() {
        if (this.isAvailable == null) this.isAvailable = true;
        if (this.remainCount == null) this.remainCount = this.room.getRoomCnt();
    }

    /* === 비즈니스 로직 === */
    // 1. 재고 차감 (예약 발생 시)
    public void decreaseStock(int count) {

    }

    // 2. 재고 복구 (예약 취소 시)
    public void increaseStock(int count) {
        ;
    }

    /* DTO → Entity */
    public void changeFromDTO(StockRequestDTO dto) {

    }
}
