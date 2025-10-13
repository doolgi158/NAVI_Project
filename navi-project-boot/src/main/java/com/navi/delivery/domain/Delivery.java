package com.navi.delivery.domain;

import com.navi.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "NAVI_DELIVERY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "deliveryGroup")
public class Delivery extends BaseEntity {

    // 배송 ID (PK)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DELIVERY_ID", nullable = false)
    private Long deliveryId;

    // 사용자 ID (FK)
    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    // 그룹 ID (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "GROUP_ID", nullable = false)
    private DeliveryGroup deliveryGroup;

    // 픽업 주소
    @Column(name = "FROM_ADDR", length = 200, nullable = false)
    private String fromAddr;

    // 배송지 주소
    @Column(name = "TO_ADDR", length = 200, nullable = false)
    private String toAddr;

    // 배송 요청일
    @Column(name = "DELIVERY_DATE", nullable = false)
    private java.time.LocalDate deliveryDate;

    // 상태값
    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;
}
