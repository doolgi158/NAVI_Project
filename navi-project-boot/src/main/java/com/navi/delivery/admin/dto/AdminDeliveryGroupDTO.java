package com.navi.delivery.admin.dto;

import com.navi.delivery.domain.DeliveryGroup;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AdminDeliveryGroupDTO {

    private String groupId;
    private String region;
    private LocalDate deliveryDate;
    private String timeSlot; // 오전 / 오후
    private String status;   // READY / IN_PROGRESS / DONE
    private int reservationCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminDeliveryGroupDTO fromEntity(DeliveryGroup group, int reservationCount) {
        return AdminDeliveryGroupDTO.builder()
                .groupId(group.getGroupId())
                .region(group.getRegion())
                .deliveryDate(group.getDeliveryDate())
                .timeSlot(group.getTimeSlot())
                .status(group.getStatus())
                .reservationCount(reservationCount)
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }
}
