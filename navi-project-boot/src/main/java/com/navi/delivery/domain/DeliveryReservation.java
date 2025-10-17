package com.navi.delivery.domain;

import com.navi.common.entity.BaseEntity;
import com.navi.common.enums.RsvStatus;
import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "NAVI_DLV_RSV")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryReservation extends BaseEntity {

    @Id
    @Column(name = "drsv_id", length = 20)
    @Comment("배송 예약 ID (예: D202510160001)")
    private String drsvId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_no", nullable = false)
    @Comment("예약 사용자 (FK: NAVI_USERS.USER_NO)")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bag_id", nullable = false)
    @Comment("가방 요금 마스터 (FK: NAVI_BAG.BAG_ID)")
    private Bag bag;

    // 그룹 배정 전 생성 가능해야 하므로 optional=true
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "group_id")
    @Comment("배송 그룹 (선택, FK: NAVI_DLV_GROUP.GROUP_ID)")
    private DeliveryGroup group;

    @Column(name = "start_addr", nullable = false)
    @Comment("출발지 주소")
    private String startAddr;

    @Column(name = "end_addr", nullable = false)
    @Comment("도착지 주소")
    private String endAddr;

    @Column(name = "delivery_date", nullable = false)
    @Comment("배송 예정일")
    private LocalDate deliveryDate;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 0)
    @Comment("총 금액")
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Comment("예약/결제 상태 (PENDING/PAID/CANCELLED/REFUNDED/FAILED/COMPLETED)")
    private RsvStatus status; // 기본값은 서비스에서 PENDING 세팅 권장
}
