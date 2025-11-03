package com.navi.flight.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.flight.dto.ApiFlightDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExternalFlightApiClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final Random random = new Random(); // 💡 Random 객체 초기화

    @Value("${api.flight.serviceKey}")
    private String serviceKey;

    private static final String JEJU_API_ID = "NAARKPC"; // 제주 (API ID)
    private static final int MIN_RANDOM_CHARGE = 55000; // 💡 랜덤 요금 최소값
    private static final int MAX_RANDOM_CHARGE = 75000; // 💡 랜덤 요금 최대값

    // 💡 API 요청에 필요한 국내 공항의 정확한 API ID 목록 (NAARK... ID)
    private static final String[] DOMESTIC_AIRPORTS_API_ID_EXCEPT_JEJU = {
            "NAARKSS",  // 김포
            "NAARKPK",  // 김해
            "NAARKTN",  // 대구
            "NAARKPU",  // 울산
            "NAARKJJ",  // 광주
            "NAARKTH",  // 포항 (NAARKTH)
            "NAARKTU",  // 청주 (NAARKTU)
            "NAARKNY",  // 양양 (NAARKNY)
            "NAARKJB",  // 무안 (NAARKJB)
            "NAARKJK",  // 군산 (NAARKJK)
            "NAARKJY",  // 여수 (NAARKJY)
            "NAARKPS",  // 사천 (NAARKPS)
            "NAARKNW",  // 원주 (NAARKNW)
            "NAARKSI"   // 인천 (NAARKSI)
    };

    /**
     * 제주 ↔ 국내공항 전체 조회
     */
    public List<ApiFlightDTO> fetchAllJejuFlights(String depDateStr) {
        List<ApiFlightDTO> result = new ArrayList<>();

        // 1️⃣ 국내 → 제주
        result.addAll(fetchFlights(Arrays.asList(DOMESTIC_AIRPORTS_API_ID_EXCEPT_JEJU), Arrays.asList(JEJU_API_ID), depDateStr));

        // 2️⃣ 제주 → 국내
        result.addAll(fetchFlights(Arrays.asList(JEJU_API_ID), Arrays.asList(DOMESTIC_AIRPORTS_API_ID_EXCEPT_JEJU), depDateStr));

        return result;
    }

    private List<ApiFlightDTO> fetchFlights(List<String> depAirports, List<String> arrAirports, String depDateStr) {
        List<ApiFlightDTO> list = new ArrayList<>();

        for (String depAirport : depAirports) {
            for (String arrAirport : arrAirports) {
                if (depAirport.equals(arrAirport)) continue;

                try {
                    String encodedServiceKey = URLEncoder.encode(serviceKey, StandardCharsets.UTF_8);

                    URI uri = UriComponentsBuilder.fromHttpUrl("http://apis.data.go.kr/1613000/DmstcFlightNvgInfoService/getFlightOpratInfoList")
                            .queryParam("serviceKey", encodedServiceKey)
                            .queryParam("depAirportId", depAirport)
                            .queryParam("arrAirportId", arrAirport)
                            .queryParam("depPlandTime", depDateStr)
                            .queryParam("_type", "json")
                            .queryParam("pageNo", 1)
                            .queryParam("numOfRows", 100)
                            .encode(StandardCharsets.UTF_8)
                            .build(true)
                            .toUri();

                    String response = restTemplate.getForObject(uri, String.class);
                    JsonNode rootNode = objectMapper.readTree(response);

                    JsonNode bodyNode = rootNode.path("response").path("body");
                    JsonNode totalCountNode = bodyNode.path("totalCount");

                    long totalCount = Optional.ofNullable(totalCountNode).map(JsonNode::asLong).orElse(0L);

                    if (totalCount == 0) {
                        log.info("[ExternalFlightApiClient] 데이터 없음 (TotalCount=0): {} → {}", depAirport, arrAirport);
                        continue;
                    }

                    log.info("[ExternalFlightApiClient] 데이터 수신 (TotalCount={}): {} → {}", totalCount, depAirport, arrAirport);

                    JsonNode itemsNode = bodyNode.path("items").path("item");

                    if (itemsNode.isArray()) {
                        for (JsonNode item : itemsNode) {
                            // 요청 시 사용한 NAARK ID를 parseFlightItem으로 전달
                            parseFlightItem(item, depAirport, arrAirport).ifPresent(list::add);
                        }
                    } else if (itemsNode.isObject()) {
                        // 요청 시 사용한 NAARK ID를 parseFlightItem으로 전달
                        parseFlightItem(itemsNode, depAirport, arrAirport).ifPresent(list::add);
                    } else {
                        log.warn("[ExternalFlightApiClient] 파싱 경고: TotalCount는 {}이나 item 노드 구조 오류", totalCount);
                    }


                } catch (Exception e) {
                    log.error("[ExternalFlightApiClient] API 호출 및 파싱 실패: {} → {}", depAirport, arrAirport, e);
                    throw new RuntimeException("[ExternalFlightApiClient] API 호출 실패", e);
                }
            }
        }

        return list;
    }


    private Optional<ApiFlightDTO> parseFlightItem(JsonNode item, String depApiId, String arrApiId) {

        try {
            // 필수 시간 정보 누락 여부만 체크
            if (!item.hasNonNull("depPlandTime") || !item.hasNonNull("arrPlandTime")) {
                throw new IllegalArgumentException("필수 시간 정보 누락");
            }

            // 오라클 NULL 방지: vihicleId
            String vihicleId = item.path("vihicleId").asText().trim();
            if (vihicleId.isEmpty()) {
                throw new IllegalArgumentException("vihicleId 누락 또는 빈 값");
            }

            // 오라클 NULL 방지: AIRLINE_NM이 비어있으면 대체 문자열 사용
            String airlineNm = item.path("airlineNm").asText().trim();
            if (airlineNm.isEmpty()) {
                airlineNm = "항공사 정보 없음";
            }

            // 💡 일반석 요금 파싱 및 랜덤 요금 적용
            int economyCharge = item.path("economyCharge").asInt();

            if (economyCharge == 0) {
                // 55,000원 ~ 75,000원 사이에서 랜덤 요금 생성
                int range = MAX_RANDOM_CHARGE - MIN_RANDOM_CHARGE;
                int randomValue = random.nextInt(range + 1) + MIN_RANDOM_CHARGE;

                // 100원 단위로 맞추기 (예: 57900원)
                economyCharge = (randomValue / 100) * 100;

                log.info("[ExternalFlightApiClient] 요금 누락. 랜덤 일반석 요금 {}원 설정 ({}->{})", economyCharge, depApiId, arrApiId);
            }

            String depPlandTimeStr = item.path("depPlandTime").asText();
            String arrPlandTimeStr = item.path("arrPlandTime").asText();

            int prestigeCharge = item.path("prestigeCharge").asInt(); // 프레스티지 요금 (0 이어도 허용)

            return Optional.of(ApiFlightDTO.builder()
                    .vihicleId(vihicleId)
                    .airlineNm(airlineNm)
                    .depAirportCode(depApiId) // 요청 시 사용한 NAARK ID
                    .arrAirportCode(arrApiId) // 요청 시 사용한 NAARK ID
                    .depPlandTime(Long.parseLong(depPlandTimeStr))
                    .arrPlandTime(Long.parseLong(arrPlandTimeStr))
                    .economyCharge(economyCharge)
                    .prestigeCharge(prestigeCharge)
                    .build());

        } catch (Exception e) {
            // 파싱 실패 시 경고 로그를 남기고 다음 항목으로 넘어갑니다.
            log.warn("[ExternalFlightApiClient] 단일 항공편 데이터 파싱 건너뛰기: {}. ({}->{})", e.getMessage(), depApiId, arrApiId);
            return Optional.empty();
        }
    }
}