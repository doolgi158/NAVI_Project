package com.navi.flight.controller;

import com.navi.flight.dto.FlightDetailResponseDTO;
import com.navi.flight.dto.FlightSearchRequestDTO;
import com.navi.flight.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ✈️ FlightController
 * - 항공편 조회 및 등록 관련 엔드포인트
 * - /api 제거 → 내부 도메인 기준 URL
 */
@RestController
@RequestMapping("/flight")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;

    /**
     * ✅ 항공편 조회 (POST)
     * 요청 예시:
     * {
     *   "depAirportCode": "CJJ",
     *   "arrAirportCode": "CJU",
     *   "depDate": "2025-10-06",
     *   "seatClass": "ECONOMY"
     * }
     */
    @PostMapping(value = "/detail", consumes = MediaType.APPLICATION_JSON_VALUE)
    public List<FlightDetailResponseDTO> getFlightList(@RequestBody FlightSearchRequestDTO dto) {
        System.out.println("📥 [FlightController] 요청 도착 → " + dto);
        List<FlightDetailResponseDTO> result = flightService.searchFlights(dto);
        System.out.println("📤 [FlightController] 응답 항목 수 = " + result.size());
        return result; // ✅ 순수 리스트 반환
    }
}
