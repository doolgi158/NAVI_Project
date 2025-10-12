package com.navi.accommodation.domain;

/*
 * ==============================
 * [NAVI_RSV_DETAIL] - RsvDetail
 * : 예약 상세 정보 테이블
 * ==============================
 */

import com.navi.reservation.domain.Rsv;
import com.navi.room.domain.Room;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "NAVI_ACC_RSV")
@SequenceGenerator(
        name = "acc_rsv_generator",
        sequenceName = "ACC_RSV_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class AccRsv {
    /* === COLUMN 정의 === */
    // 상세 ID (예: 1)
    @Id @Column(name = "detail_id")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "acc_rsv_generator")
    private Long detailId;

    // 예약 ID (예: 20250423ACC011)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserve_id", nullable = false)
    private Rsv rsv;

    // 객실 ID (예: ROM003)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // 객실 수 (예: 2)
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    // 객실 가격 (예: 74000)
    @Column(name = "room_price", nullable = false)
    private Integer roomPrice;

    // 총 금액 (예: 148000)
    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    // 숙박 시작일 (예: 2025-08-31)
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    // 숙박 종료일 (예: 2025-09-02)
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
}
