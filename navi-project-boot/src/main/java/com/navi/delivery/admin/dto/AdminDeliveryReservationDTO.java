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
    private String groupId;    // FK → NAVI_DLV_GROUP.GROUP_ID (nullable)

    // ✅ 표시용
    private String userName;

    private String startAddr;
    private String endAddr;
    private LocalDate deliveryDate;
    private BigDecimal totalPrice;
    private RsvStatus status;

    /**
     * ✅ 가방별 정보(JSON 문자열 그대로 전달)
     */
    private String bagsJson;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
