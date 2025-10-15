package com.navi.accommodation.domain;

/* =======[NAVI_ACC_RSV]=======
        숙소 예약 관리 테이블
   ============================ */

import com.navi.common.enums.RsvStatus;
import com.navi.room.domain.Room;
import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(
        name = "NAVI_ACC_RSV",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UK_ACC_RSV_RESERVE_LINE",
                        columnNames = {"arsv_id", "room_id", "start_date", "end_date"}
                )
        },
        indexes = {
                @Index(name = "IDX_ACC_RSV_ARSVID", columnList = "arsv_id"),
                //@Index(name = "IDX_ACC_RSV_USER", columnList = "user_no"),
                //@Index(name = "IDX_ACC_RSV_AVAIL", columnList = "room_id, start_date, end_date")
        }
)
@SequenceGenerator(
        name = "acc_rsv_generator",
        sequenceName = "ACC_RSV_SEQ",
        initialValue = 1,
        allocationSize = 1
)
public class AccRsv {
    /* === COLUMN 정의 === */
    // 내부 식별번호 (예: 1)
    @Id @Column(name = "no")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "acc_rsv_generator")
    private Long no;

    // 예약 ID (예: 20250911ACC001)
    @Column(name = "arsv_id", length=30, nullable = false)
    private String arsvId;

    /* 연관관계 설정 */
    // 사용자 ID (예: 1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    private User user;

    /* 연관관계 설정 */
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

    // 숙박 시작일 (예: 2025-08-31)
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    // 숙박 종료일 (예: 2025-09-02)
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // 예약 상태 (예: PENDING, CANCELED, ...)
    @Column(name = "rsv_status", length = 20, nullable=false)
    @Enumerated(EnumType.STRING)
    private RsvStatus rsvStatus;

    // 낙관적 락 버전 (동시성 제어)
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    /* === 기본값 보정 === */
    @PrePersist
    public void prePersist() {
        if (rsvStatus == null) rsvStatus = RsvStatus.PENDING;
        if (!endDate.isAfter(startDate)) {
            throw new IllegalStateException("체크아웃 날짜는 체크인 날짜 이후여야 합니다.");
        }

        // arsvId 자동 생성
        if(arsvId == null && no != null){
            String today = LocalDate.now(ZoneId.of("Asia/Seoul")).format(DateTimeFormatter.BASIC_ISO_DATE); // yyyyMMdd
            arsvId = String.format("%sACC%03d", today, no);
        }
    }
}
