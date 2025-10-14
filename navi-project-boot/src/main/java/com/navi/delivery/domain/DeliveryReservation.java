package com.navi.delivery.domain;

import com.navi.common.entity.BaseEntity;
import com.navi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * NAVI_DLV_RSV
 * - 짐배송 예약상세 테이블
 * - 출발/도착 주소, 요청일, 가방 정보, 금액, 상태, 결제일 관리
 */
@Entity
@Table(name = "NAVI_DLV_RSV")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryReservation extends BaseEntity {

    @Id
    @Column(name = "DRSV_ID", length = 20)
    private String drsvId; // 배송예약 ID (예: D202510140001)

    @Column(name = "START_ADDR", length = 200, nullable = false)
    private String startAddr; // 출발지 주소

    @Column(name = "END_ADDR", length = 200, nullable = false)
    private String endAddr; // 도착지 주소

    @Column(name = "DELIVERY_DATE", nullable = false)
    private LocalDate deliveryDate; // 배송 희망일자

    @Column(name = "TOTAL_PRICE", nullable = false)
    private BigDecimal totalPrice; // 총 금액

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status = "PENDING"; // 결제 상태 (PENDING / PAID / CANCELLED / FAILED)

    @Column(name = "PAID_AT")
    private LocalDate paidAt; // 결제 완료 일자 (선택)

    // ===== 연관관계 =====

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_NO", nullable = false)
    private User user; // NAVI_USER 참조

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BAG_ID", nullable = false)
    private Bag bag; // NAVI_DLV_BAG 참조

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "GROUP_ID", nullable = false)
    private DeliveryGroup group; // NAVI_DLV_GROUP 참조
}
