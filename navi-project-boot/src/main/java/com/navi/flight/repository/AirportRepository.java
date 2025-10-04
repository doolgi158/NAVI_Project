package com.navi.flight.repository;

import com.navi.flight.domain.Airport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 공항 Repository
 * - DB와 직접 연결 (CRUD)
 * - JPA가 메서드 이름 기반으로 자동 쿼리 생성
 */
public interface AirportRepository extends JpaRepository<Airport, String> {

    /**
     * 공항명(한글)으로 정확히 조회
     * 예: "제주" → Airport(CJU, 제주)
     */
    Optional<Airport> findByAirportName(String airportName);

    /**
     * 공항명 일부로 조회 (괄호 등 포함된 경우 대응)
     * 예: "부산" → Airport(PUS, 김해(부산))
     */
    Optional<Airport> findByAirportNameContaining(String keyword);
}
