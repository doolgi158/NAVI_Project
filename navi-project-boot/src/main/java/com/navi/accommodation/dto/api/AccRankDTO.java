package com.navi.accommodation.dto.api;

import com.navi.accommodation.domain.Acc;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccRankDTO {
    private String id;
    private String name;
    private String region;
    private long views;
    private String thumbnailPath;

    public static AccRankDTO from(Acc acc) {
        return AccRankDTO.builder()
                .id(acc.getAccId())
                .name(acc.getTitle())
                .region(acc.getTownship() != null ? acc.getTownship().getTownshipName() : "")
                .views(acc.getViewCount())
                .build();
    }
}