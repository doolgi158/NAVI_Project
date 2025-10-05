package com.navi.flight.controller;

import com.navi.flight.dto.FlightDetailResponseDTO;
import com.navi.flight.dto.FlightSearchRequestDTO;
import com.navi.flight.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ✈️ FlightController
 * - 항공편 조회 관련 REST API 진입점
 * - 프론트엔드에서 /api/flights/search 로 POST 요청
 */
@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;

    /**
     * ✅ 항공편 검색
     * 요청 예시:
     * POST /api/flights/search
     * {
     *   "depAirportCode": "GMP",
     *   "arrAirportCode": "CJU",
     *   "depDate": "2025-10-05",
     *   "seatClass": "ECONOMY"
     * }
     */
    @PostMapping("/search")
    public List<FlightDetailResponseDTO> searchFlights(
            @RequestBody FlightSearchRequestDTO requestDTO
    ) {
        return flightService.searchFlights(requestDTO);
    }
}
