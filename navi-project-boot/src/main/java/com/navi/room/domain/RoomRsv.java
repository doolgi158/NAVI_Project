package com.navi.room.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.navi.common.enums.RsvStatus;
import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/* ============================================================
   [RoomRsv]
   - 객실 단위 예약 관리 테이블
   - RoomStock과 직접 연동되어 재고 차감/복구 관리
   - 결제, 환불, 이용 완료까지 상태 흐름 관리
   ============================================================ */

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(
        name = "NAVI_ROOM_RSV",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UK_ROOM_RSV_UNIQUE",
                        columnNames = {"room_rsv_id", "room_id", "stock_date"}
                )
        },
        indexes = {
                @Index(name = "IDX_ROOM_RSV_RSVID", columnList = "room_rsv_id"),
                @Index(name = "IDX_ROOM_RSV_USER", columnList = "user_no"),
                @Index(name = "IDX_ROOM_RSV_STOCK", columnList = "stock_date")
        }
)
@SequenceGenerator(
        name = "room_rsv_seq_generator",
        sequenceName = "ROOM_RSV_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class RoomRsv {

    /* === 기본 키 === */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "room_rsv_seq_generator")
    @Column(name = "no")
    private Long no;

    // 예약 ID (예: 20251019ROM0001)
    @Column(name = "room_rsv_id", length = 30, nullable = false, unique = true)
    private String roomRsvId;

    /* === 연관관계 === */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_no", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_stock_id", nullable = false)
    @JsonBackReference
    private RoomStock roomStock;

    /* === 예약 정보 === */
    @Column(name = "stock_date", nullable = false)
    private LocalDate stockDate;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "price", nullable = false)
    private Integer price;

    @Enumerated(EnumType.STRING)
    @Column(name = "rsv_status", length = 20, nullable = false)
    private RsvStatus rsvStatus;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    /* === 엔티티 생성 시 기본값 처리 === */
    @PrePersist
    public void prePersist() {
        if (rsvStatus == null) {
            rsvStatus = RsvStatus.PENDING; // 기본 생성 시 "결제 대기"
        }

        if (roomRsvId == null && no != null) {
            String today = LocalDate.now(ZoneId.of("Asia/Seoul"))
                    .format(DateTimeFormatter.BASIC_ISO_DATE);
            roomRsvId = String.format("%sROM%04d", today, no);
        }

        if (quantity == null || quantity <= 0) {
            throw new IllegalStateException("예약 수량은 1개 이상이어야 합니다.");
        }
    }

    /** 예약 결제 완료 */
    public void markPaid() {
        this.rsvStatus = RsvStatus.PAID;
    }

    /** 예약 취소 (결제 취소 전 or 후) */
    public void markCancelled() {
        this.rsvStatus = RsvStatus.CANCELLED;
    }

    /** 예약 환불 완료 */
    public void markRefunded() {
        this.rsvStatus = RsvStatus.REFUNDED;
    }

    /** 예약 실패 (결제 실패 포함) */
    public void markFailed() {
        this.rsvStatus = RsvStatus.FAILED;
    }

    /** 이용 완료 처리 */
    public void markCompleted() {
        this.rsvStatus = RsvStatus.COMPLETED;
    }

    /** 금액 변경 */
    public void updatePrice(Integer newPrice) {
        if (newPrice != null && newPrice >= 0) {
            this.price = newPrice;
        }
    }
}