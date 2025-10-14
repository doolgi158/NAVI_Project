package com.navi.delivery.domain;

import com.navi.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "NAVI_dRsv")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"delivery", "bag"})
public class DeliveryReservation extends BaseEntity {

    // 예약 ID (PK)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RSV_ID", nullable = false)
    private Long rsvId;

    // 배송 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DELIVERY_ID", nullable = false)
    private Delivery delivery;

    // 가방 타입 (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BAG_ID", nullable = false)
    private Bag bag;

    // 가방 개수
    @Column(name = "BAG_QTY", nullable = false)
    private Integer bagQty;

    // 총 요금
    @Column(name = "TOTAL_PRICE", nullable = false)
    private Integer totalPrice;

    // 메모
    @Column(name = "MEMO", length = 300)
    private String memo;
}
