package com.navi.travel.service;


import com.navi.travel.dto.ListResponseDTO;
import com.navi.travel.dto.TravelApiItemDTO;

public interface TravelApiService {
    public Long register(TravelApiItemDTO travelApiItemDTO);
    public TravelApiItemDTO get(Long travelId); //조회
    public void modify(TravelApiItemDTO travelApiItemDTO); //수정
    public void remove(Long travelId); //삭제
    
    public int saveApiData();   //API 호출 및 데이터 수집/저장을 위한 메소드


    // TravelApiService.java (인터페이스 또는 서비스 구현체)
    ListResponseDTO<TravelApiItemDTO> getList(int page, int size);
}