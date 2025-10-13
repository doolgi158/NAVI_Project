package com.navi.delivery.domain;

import com.navi.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "NAVI_BAG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Bag extends BaseEntity {

    // 가방 크기 (PK)
    @Id
    @Column(name = "BAG_SIZE", length = 10, nullable = false)
    private String bagSize;

    // 최대 무게 (kg)
    @Column(name = "MAX_WEIGHT", nullable = false)
    private Integer maxWeight;

    // 기본 요금
    @Column(name = "BASE_PRICE", nullable = false)
    private Integer basePrice;
}
