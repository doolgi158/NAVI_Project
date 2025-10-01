package com.navi.travel.service;


import com.navi.travel.dto.TravelApiItemDTO;

public interface TravelApiService {
    public Long register(TravelApiItemDTO travelApiItemDTO);  
    
    public int saveApiData();   //API 호출 및 데이터 수집/저장을 위한 메소드


}