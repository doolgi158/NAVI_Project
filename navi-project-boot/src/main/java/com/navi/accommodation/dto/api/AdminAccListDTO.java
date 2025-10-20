package com.navi.accommodation.dto.api;

import com.navi.accommodation.domain.Acc;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminAccListDTO {
    private Long accNo;
    private String title;
    private String category;
    private String address;
    private String tel;
    private boolean isActive;
    private boolean isDeletable;

    public static AdminAccListDTO fromEntity(Acc acc) {
        return AdminAccListDTO.builder()
                .accNo(acc.getAccNo())
                .title(acc.getTitle())
                .category(acc.getCategory())
                .address(acc.getAddress())
                .tel(acc.getTel())
                .isActive(acc.isActive())
                .isDeletable(acc.isDeletable())
                .build();
    }
}
