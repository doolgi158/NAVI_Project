package com.navi.room.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.navi.common.entity.BaseEntity;
import com.navi.common.enums.RsvStatus;
import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
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
                        columnNames = {"reserve_id", "room_id"}
                )
        },
        indexes = {
                @Index(name = "IDX_ROOM_RSV_RSVID", columnList = "reserve_id"),
                @Index(name = "IDX_ROOM_RSV_USER", columnList = "user_no"),
        }
)
@SequenceGenerator(
        name = "room_rsv_seq_generator",
        sequenceName = "ROOM_RSV_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class RoomRsv extends BaseEntity{
    /* === 기본 키 === */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "room_rsv_seq_generator")
    @Column(name = "no")
    private Long no;

    // 예약 ID (예: 20251019ROM0001)
    @Column(name = "reserve_id", length = 30, nullable = false)
    private String reserveId;

    /* === 연관관계 === */
    // 사용자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private User user;

    // 객실 (Room) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_no", nullable = false)
    @JsonBackReference
    private Room room;

    /* === 예약 기본 정보 === */
    // 객실수
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    // 객실단가
    @Column(name = "price", nullable = false)
    private BigDecimal price;

    // 체크인날짜
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    // 체크아웃날짜
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // 숙박 인원수
    @Column(name = "guest_count", nullable = false)
    private int guestCount;

    // 숙박일수
    @Column(name="nights", nullable = false)
    private int nights;

    @Enumerated(EnumType.STRING)
    @Column(name = "rsv_status", length = 20, nullable = false)
    private RsvStatus rsvStatus;

    /* === 예약자 정보 === */
    @Column(name = "reserver_name", length = 50)
    private String reserverName;

    @Column(name = "reserver_tel", length = 20)
    private String reserverTel;

    @Column(name = "reserver_email", length = 100)
    private String reserverEmail;

    @Column(name = "reserver_birth", length = 100)
    private LocalDate reserverBirth;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    /* === 기본값 처리 === */
    @PrePersist
    public void prePersist() {
        // 기본 상태 설정
        if (rsvStatus == null) { rsvStatus = RsvStatus.PENDING; }
        // 수량 유효성
        if (quantity <= 0)  throw new IllegalStateException("예약 수량은 1개 이상이어야 합니다.");
        if (guestCount <= 0) throw new IllegalStateException("숙박 인원은 1명 이상이어야 합니다.");
    }

    /* === 상태 변경 메서드 === */
    public void markPaid()       { this.rsvStatus = RsvStatus.PAID; }
    public void markCancelled()  { this.rsvStatus = RsvStatus.CANCELLED; }
    public void markRefunded()   { this.rsvStatus = RsvStatus.REFUNDED; }
    public void markFailed()     { this.rsvStatus = RsvStatus.FAILED; }

    /* === 가격 수정 === */
    public void updatePrice(BigDecimal newPrice) {
        if (newPrice != null && newPrice.compareTo(BigDecimal.ZERO) >= 0) {
            this.price = newPrice;
        }
    }

    /* === 예약자 정보 갱신 === */
    public void updateReserverInfo(String name, String tel, String email, String birth) {
        if (name != null && !name.isBlank()) this.reserverName = name;
        if (tel != null && !tel.isBlank()) this.reserverTel = tel;
        if (email != null && !email.isBlank()) this.reserverEmail = email;
        if (birth != null && !birth.isBlank()) this.reserverBirth = LocalDate.parse(birth);
    }
}