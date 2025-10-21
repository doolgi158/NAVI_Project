package com.navi.delivery.admin.dto;

import com.navi.delivery.domain.Bag;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AdminBagDTO {

    private Long bagId;
    private String bagCode;
    private String bagName;
    private int price;

    // ✅ BaseEntity 필드 반영
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminBagDTO fromEntity(Bag bag) {
        return AdminBagDTO.builder()
                .bagId(bag.getBagId())
                .bagCode(bag.getBagCode())
                .bagName(bag.getBagName())
                .price(bag.getPrice())
                .createdAt(bag.getCreatedAt())
                .updatedAt(bag.getUpdatedAt())
                .build();
    }

    public Bag toEntity() {
        return Bag.builder()
                .bagId(this.bagId)
                .bagCode(this.bagCode)
                .bagName(this.bagName)
                .price(this.price)
                .build();
    }
}
