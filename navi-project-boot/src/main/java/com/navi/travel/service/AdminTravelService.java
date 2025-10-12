package com.navi.travel.service;

import com.navi.travel.dto.admin.AdminTravelListResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminTravelService {
    Page<AdminTravelListResponseDTO> getAdminTravelList(Pageable pageable, String search);

    void deleteTravel(Long travelId);

    void updateState(List<Integer> ids, Integer state);
}
