package com.navi.flight.service;

import com.navi.flight.dto.ApiFlightDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/*
 * ✈️ ApiFlightService
 * - 공공데이터포털 국내선 항공편 조회 API 호출 전용 서비스
 * - 실제 API 연동 or JSON Mock 데이터 로드 가능
 */
@Slf4j
@Service
public class ApiFlightService {

    /*
     * 공공데이터포털 API 호출
     * (현재는 Mock 데이터 or APIClient로 교체 가능)
     */
    public List<ApiFlightDTO> fetchTodayFlights() {
        log.info("[API] 공공데이터 항공편 조회 요청");

        // TODO: 실제 API 연동 or Mock JSON 읽기 로직 구현
        // return apiClient.getDomesticFlights("20251005");

        return List.of(); // 임시 빈 리스트
    }
}
