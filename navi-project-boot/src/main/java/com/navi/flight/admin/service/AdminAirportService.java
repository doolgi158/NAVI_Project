package com.navi.flight.admin.service;

import com.navi.flight.admin.dto.AdminAirportDTO;
import com.navi.flight.domain.Airport;

import java.util.List;

public interface AdminAirportService {

    // 전체 공항 목록 조회
    List<Airport> findAll();

    // 공항 등록
    Airport createAirport(AdminAirportDTO dto);

    // 공항 수정
    Airport updateAirport(String code, AdminAirportDTO dto);

    // 공항 삭제
    void deleteAirport(String airportCode);
}
