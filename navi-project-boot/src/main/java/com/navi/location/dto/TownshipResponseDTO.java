package com.navi.location.dto;

import com.navi.location.domain.Township;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TownshipResponseDTO {
    private Long townshipId;
    private String sigunguName;   // 제주시 / 서귀포시
    private String townshipName;  // 애월읍 / 한림읍 등

    public static TownshipResponseDTO fromEntity(Township entity) {
        return TownshipResponseDTO.builder()
                .townshipId(entity.getTownshipId())
                .sigunguName(entity.getSigunguName())
                .townshipName(entity.getTownshipName())
                .build();
    }
}

