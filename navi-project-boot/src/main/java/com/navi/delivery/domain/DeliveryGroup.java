package com.navi.delivery.domain;

import com.navi.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * NAVI_DLV_GROUP
 * - 짐배송 배차 그룹 테이블
 * - 같은 날짜 + 지역 + 시간대 기준으로 묶여 관리됨
 */
@Entity
@Table(name = "NAVI_DLV_GROUP")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryGroup extends BaseEntity {

    @Id
    @Column(name = "GROUP_ID", length = 20)
    private String groupId; // 그룹 고유 ID (예: G20251015_JEJU_AM_1)

    @Column(name = "REGION", length = 50, nullable = false)
    private String region; // 그룹 지역 (제주시 / 서귀포시)

    @Column(name = "DELIVERY_DATE", nullable = false)
    private LocalDate deliveryDate; // 그룹 배송 예정일

    @Column(name = "TIME_SLOT", length = 20, nullable = false)
    private String timeSlot = "오전"; // 오전 / 오후 (기본값 오전)

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status = "READY"; // READY / IN_PROGRESS / COMPLETED
}
