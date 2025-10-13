package com.navi.delivery.domain;

import com.navi.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "NAVI_DELIVERY_GROUP")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class DeliveryGroup extends BaseEntity {

    // 그룹 ID (PK)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "GROUP_ID", nullable = false)
    private Long groupId;

    // 그룹명
    @Column(name = "GROUP_NAME", length = 50, nullable = false)
    private String groupName;

    // 그룹 날짜
    @Column(name = "GROUP_DATE", nullable = false)
    private java.time.LocalDate groupDate;

    // 지역
    @Column(name = "REGION", length = 100, nullable = false)
    private String region;

    // 상태값
    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;
}
