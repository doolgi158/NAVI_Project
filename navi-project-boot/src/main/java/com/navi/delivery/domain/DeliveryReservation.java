package com.navi.delivery.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @JsonIgnore
    private User user;

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
    @Comment("예약/결제 상태 (PENDING/PAID/CANCELLED/REFUNDED/FAILED)")
    private RsvStatus status;

    /**
     * ✅ 가방별 수량 정보를 JSON 형태로 저장
     */
    @Lob
    @Column(name = "bags_json", columnDefinition = "CLOB")
    @Comment("가방별 정보 JSON (예: {\"S\":2,\"M\":1,\"L\":0})")
    private String bagsJson;

    // ✅ 상태 변경 헬퍼
    public void markAsPaid() {
        this.status = RsvStatus.PAID;
    }

    public void markAsFailed() {
        this.status = RsvStatus.FAILED;
    }
}
