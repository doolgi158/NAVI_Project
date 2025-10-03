package com.navi.flight.service;

import com.navi.flight.domain.Airport;

/**
 * 공항 데이터 서비스
 * - JSON 데이터를 DB에 저장
 * - 저장된 공항 개수 확인
 * - 공항명/코드 기반 조회
 */
public interface AirportService {

    /**
     * 공항 데이터를 JSON에서 읽어와 DB에 저장
     */
    void loadAirportData();

    /**
     * 저장된 공항 개수 조회
     */
    long countAirports();

    /**
     * 한글 공항명으로 공항 코드 조회
     * 예: "제주" → "CJU"
     */
    String getAirportCodeByName(String airportName);

    /**
     * 공항 코드로 엔티티 조회
     * 예: "CJU" → Airport(CJU, 제주)
     */
    Airport getAirportByCode(String airportCode);
}
