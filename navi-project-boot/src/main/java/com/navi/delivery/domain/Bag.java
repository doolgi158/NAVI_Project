// src/main/java/com/navi/delivery/domain/Bag.java
package com.navi.delivery.domain;

import com.navi.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "NAVI_DLV_BAG")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Bag extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BAG_ID")
    private Long bagId;

    @Column(name = "BAG_CODE", nullable = false, unique = true)
    private String bagCode;

    @Column(name = "BAG_NAME", nullable = false)
    private String bagName;

    @Column(name = "PRICE", nullable = false)
    private int price;
}
