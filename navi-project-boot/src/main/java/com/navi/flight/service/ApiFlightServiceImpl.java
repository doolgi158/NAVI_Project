package com.navi.flight.service;

import com.navi.flight.domain.Airport;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightId;
import com.navi.flight.dto.ApiFlightDTO;
import com.navi.flight.repository.AirportRepository;
import com.navi.flight.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ApiFlightServiceImpl implements ApiFlightService {

    private final FlightRepository flightRepository;
    private final ExternalFlightApiClient externalFlightApiClient;
    private final AirportRepository airportRepository;

    private static final DateTimeFormatter formatterShort = DateTimeFormatter.ofPattern("yyyyMMddHHmm");
    private static final DateTimeFormatter formatterLong = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    // 💡 NAARK ID를 DB에 저장된 IATA 코드로 매핑하는 맵 (Map.of() 개수 제한 때문에 HashMap으로 변경)
    private static final Map<String, String> API_ID_TO_IATA;

    static { // 💡 static 초기화 블록 사용
        Map<String, String> map = new HashMap<>();

        // 15개 항목을 put 메서드로 초기화
        map.put("NAARKPC", "CJU");  // 제주
        map.put("NAARKSS", "GMP");  // 김포
        map.put("NAARKPK", "PUS");  // 김해/부산
        map.put("NAARKTN", "TAE");  // 대구
        map.put("NAARKPU", "USN");  // 울산
        map.put("NAARKTU", "CJJ");  // 청주
        map.put("NAARKSI", "ICN");  // 인천
        map.put("NAARKJK", "KUV");  // 군산
        map.put("NAARKJY", "RSU");  // 여수
        map.put("NAARKJJ", "KWJ");  // 광주
        map.put("NAARKTH", "KPO");  // 포항
        map.put("NAARKPS", "HIN");  // 사천
        map.put("NAARKJB", "MWX");  // 무안
        map.put("NAARKNW", "WJU");  // 원주
        map.put("NAARKNY", "YNY");  // 양양

        API_ID_TO_IATA = map;
    }


    @Override
    public void initFlightsNext30Days() {
        log.info("[ApiFlightService] 오늘부터 30일치 제주 항공편 생성 시작");

        for (int dayOffset = 0; dayOffset < 30; dayOffset++) {
            LocalDateTime depDate = LocalDateTime.now().plusDays(dayOffset).withHour(0).withMinute(0).withSecond(0).withNano(0);
            String depDateStr = depDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));

            List<ApiFlightDTO> flights = externalFlightApiClient.fetchAllJejuFlights(depDateStr);
            log.info("[ApiFlightService] {} 날짜, 총 {}개 항공편 데이터 수신", depDateStr, flights.size());

            for (ApiFlightDTO dto : flights) {
                try {
                    // 💡 공항 ID를 조회할 때, trim() 처리된 ID를 사용합니다.
                    Airport depAirport = findAirportByApiId(dto.getDepAirportCode());
                    Airport arrAirport = findAirportByApiId(dto.getArrAirportCode());


                    LocalDateTime depTime = parseDateTime(dto.getDepPlandTime());
                    LocalDateTime arrTime = parseDateTime(dto.getArrPlandTime());

                    if (flightRepository.existsByFlightId_FlightIdAndFlightId_DepTime(dto.getVihicleId(), depTime)) {
                        log.debug("[중복] 이미 존재하는 항공편: {} {}", dto.getVihicleId(), depTime);
                        continue;
                    }

                    Flight flight = Flight.builder()
                            .flightId(new FlightId(dto.getVihicleId(), depTime))
                            .airlineNm(dto.getAirlineNm())
                            .depAirport(depAirport)
                            .arrAirport(arrAirport)
                            .arrTime(arrTime)
                            .economyCharge(dto.getEconomyCharge())
                            .prestigeCharge(dto.getPrestigeCharge())
                            .seatInitialized(false)
                            .build();

                    flightRepository.save(flight);
                    log.info("[저장 완료] {} {} → {}", dto.getVihicleId(), depAirport.getAirportCode(), arrAirport.getAirportCode());

                } catch (Exception e) {
                    log.error("[실패] 항공편 저장 실패: flightId={} / dep={} / arr={} : {}",
                            dto.getVihicleId(),
                            dto.getDepAirportCode(),
                            dto.getArrAirportCode(),
                            e.getMessage(), e);
                }
            }
        }

        log.info("[ApiFlightService] 30일치 제주 항공편 저장 완료");
    }

    private LocalDateTime parseDateTime(Long time) {
        String str = time.toString();
        try {
            if (str.length() == 12) return LocalDateTime.parse(str, formatterShort);
            if (str.length() == 14) return LocalDateTime.parse(str, formatterLong);

            throw new RuntimeException("지원하지 않는 시간 형식: " + str);
        } catch (Exception e) {
            log.error("시간 변환 실패: {}", str, e);
            throw e;
        }
    }

    /**
     * API ID(NAARK...)를 DB 키(IATA)로 변환하여 Airport 엔티티를 조회합니다.
     */
    private Airport findAirportByApiId(String apiId) {
        // 필수 수정: trim()을 사용하여 양쪽 끝의 공백을 제거합니다.
        String cleanApiId = apiId.trim();

        // HashMap은 개수 제한이 없어 정상적으로 조회됩니다.
        String iataCode = API_ID_TO_IATA.getOrDefault(cleanApiId, null);

        if (iataCode == null) {
            log.error("미등록 API 공항 ID: {}", cleanApiId);
            throw new RuntimeException("미등록 API 공항 ID: " + cleanApiId);
        }

        return airportRepository.findById(iataCode)
                .orElseThrow(() -> new RuntimeException("DB에 공항 정보 없음 (IATA: " + iataCode + ")"));
    }
}