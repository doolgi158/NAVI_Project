package com.navi.flight.domain;

import com.navi.common.entity.BaseEntity;
import com.navi.common.enums.RsvStatus;
import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * NAVI_FLY_RSV (항공편 예약 테이블)
 * - DeliveryReservation 구조와 동일한 패턴으로 리팩토링됨
 * - 결제, 상태, 유저 FK, JSON 탑승자 관리 포함
 */
@Entity
@Table(name = "NAVI_FLY_RSV")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightReservation extends BaseEntity {

    @Id
    @Column(name = "frsv_id", length = 20)
    @Comment("항공편 예약 ID (예: F202510140001)")
    private String frsvId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_no", nullable = false)
    @Comment("예약 사용자 (FK)")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "flight_id", referencedColumnName = "flight_id", nullable = false),
            @JoinColumn(name = "dep_time", referencedColumnName = "dep_time", nullable = false)
    })
    @Comment("항공편 정보 (복합키 기반 FK)")
    private Flight flight;

    @Column(name = "total_price", nullable = false)
    @Comment("결제 금액")
    private BigDecimal totalPrice;

    @Builder.Default
    @Column(name = "status", length = 20, nullable = false)
    @Comment("예약 상태 (PENDING/PAID/CANCELLED/REFUNDED/FAILED/COMPLETED)")
    private RsvStatus status = RsvStatus.PENDING;

    @Lob
    @Column(name = "passengers_json", columnDefinition = "CLOB", nullable = false)
    @Comment("탑승자 정보 (JSON 형식)")
    private String passengersJson;

    @Column(name = "paid_at")
    @Comment("결제 완료 일자")
    private LocalDate paidAt;
}
