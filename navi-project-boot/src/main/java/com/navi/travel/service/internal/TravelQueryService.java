package com.navi.travel.service.internal;

import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TravelQueryService {
    TravelDetailResponseDTO getTravelDetail(Long travelId, String id);

    Page<TravelListResponseDTO> getTravelList(Pageable pageable, List<String> region2Names, String category, String search, boolean publicOnly);
}
