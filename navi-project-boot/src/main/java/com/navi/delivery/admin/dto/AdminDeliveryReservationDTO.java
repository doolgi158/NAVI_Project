package com.navi.delivery.admin.dto;

import com.navi.common.enums.RsvStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDeliveryReservationDTO {

    private String drsvId;

    // ✅ FK 참조
    private Long userNo;       // FK → NAVI_USERS.USER_NO
    private Long bagId;        // FK → NAVI_DLV_BAG.BAG_ID
    private String groupId;    // FK → NAVI_DLV_GROUP.GROUP_ID (nullable)

    // ✅ 표시용
    private String userName;
    private String bagName;
    private int bagPrice;

    private String startAddr;
    private String endAddr;
    private LocalDate deliveryDate;
    private BigDecimal totalPrice;
    private RsvStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
