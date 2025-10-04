package com.navi.travel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.navi.travel.domain.Travel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 제주 API의 응답 본문 전체를 매핑하는 DTO 클래스.
 */
@Getter
@Setter
@ToString
@NoArgsConstructor
public class TravelApiResponseBody {

    private int count;

    @JsonProperty("items")
    private List<TravelApiItemDTO> travelItems;

    public List<Travel> toTravelEntities() {
        if (travelItems == null) return List.of();

        return travelItems.stream()
                .map(TravelApiItemDTO::toEntity)
                .collect(Collectors.toList());
    }
}
