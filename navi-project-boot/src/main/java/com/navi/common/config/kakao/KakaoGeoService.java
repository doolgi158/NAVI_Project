package com.navi.common.config.kakao;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;

import java.math.BigDecimal;

/**
 * ======================================================
 * [KakaoGeoService]
 * : Kakao Local API를 이용한 주소 -> 좌표 + 읍면동 변환 서비스
 * ======================================================
 */

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoGeoService {
    // Kakao API Key
    private final KakaoConfig kakaoConfig;
    // 외부 REST API와 HTTP 통신을 수행하는 객체
    private final RestTemplate restTemplate = createRestTemplate();
    // Kakao Local API 엔드포인트
    private static final String ADDRESS_URL = "https://dapi.kakao.com/v2/local/search/address.json";

    // RestTemplate 초기화 메서드
    private RestTemplate createRestTemplate() {
        RestTemplate template = new RestTemplate();
        template.setUriTemplateHandler(new DefaultUriBuilderFactory());
        return template;
    }

    /** 주소 -> 좌표 + 읍면동 변환 */
    public GeoResult getCoordinatesAndTownship(String address) {
        if(address == null || address.isBlank()) {
            log.warn("[KAKAO] 주소가 비어있습니다.");
            return null;
        }

        // 요청 헤더 설정(필수 설정)
        // Authorization: KakaoAK ${REST_API_KEY}
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoConfig.getApiKey());
        // 요청 엔티티 생성(헤더 포함)
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // 요청 URL 생성
        String uri = new DefaultUriBuilderFactory().builder()
                .path(ADDRESS_URL)
                .queryParam("query", address)
                .queryParam("analyze_type", "similar")
                .build()
                .toString();

        try {
            // API 호출(GET)
            ResponseEntity<JsonNode> response
                    = restTemplate.exchange(        // exchange() : HTTP 요청을 보내고 응답을 받는 메서드
                            uri,                    // 요청 URL
                            HttpMethod.GET,         // 요청 방식 (GET)
                            entity,                 // 요청 엔티티 (헤더)
                            JsonNode.class          // 으답을 JSON 트리 구조로 받음
                    );

            if (response.getBody() == null || response.getBody().path("documents").isEmpty()) {
                log.warn("[KAKAO] 검색 결과 없음 → {}", address);
                return null;
            }

            // 응답 데이터(JSON) 파싱
            JsonNode document = response.getBody().path("documents").get(0);

            // 좌표
            BigDecimal mapx = new BigDecimal(document.path("x").asText());
            BigDecimal mapy = new BigDecimal(document.path("y").asText());

            // 주소 타입에 따라 지역 정보 선택
            String addressType = document.path("address_type").asText();
            JsonNode regionNode = "ROAD_ADDR".equals(addressType)
                    ? document.path("road_address")
                    : document.path("address");

            String region2 = regionNode.path("region_2depth_name").asText(); // 서귀포시 / 제주시
            String region3 = regionNode.path("region_3depth_name").asText(); // 읍/면/동

            // 서귀포시내 & 제주시내 그룹화 로직
            String townshipName;
            if ("서귀포시".equals(region2) && region3.endsWith("동")) {
                townshipName = "서귀포시내";
            } else if ("제주시".equals(region2) && region3.endsWith("동")) {
                townshipName = "제주시내";
            } else {
                townshipName = region3;
            }

            log.info("[KAKAO] 변환 결과 → {} → {}, {}, {}, ({}, {})",
                    address, region2, region3, townshipName, mapx, mapy);

            // 7️⃣ 결과 반환
            return new GeoResult(mapx, mapy, townshipName);

        }catch(Exception e) {
            log.error("[KAKAO] 주소 변환 실패: {} ({})", address, e.getMessage());
            return null;
        }
    }

    /** ✅ JSON 미리보기용 메서드 (컨트롤러에서 사용됨) */
    private final ObjectMapper objectMapper = new ObjectMapper();
    public String previewGeoJson(String address) {
        GeoResult result = getCoordinatesAndTownship(address);
        if (result == null) {
            return "{ \"error\": \"주소 변환 실패\" }";
        }

        try {
            return objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(result);
        } catch (Exception e) {
            return "{ \"error\": \"JSON 변환 실패\" }";
        }
    }
}
