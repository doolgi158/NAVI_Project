package com.navi.travel.service;

import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TravelService {
    Page<TravelListResponseDTO> getTravelList(Pageable pageable);    //여행지리스트
    TravelDetailResponseDTO getTravelDetail(Long travelId);  //여행지 상세
    int saveApiData();   //api데이터저장


}