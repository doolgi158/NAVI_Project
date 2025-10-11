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
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/*
 * ======================================================
 * [KakaoGeoService]
 * : Kakao Local API를 이용한 주소 -> 좌표 + 읍면동 변환 서비스
 * ======================================================
 * ㄴ 호출 순서:
 *   (1) 기본 주소 → (2) 축약 주소 → (3) 숙소명 (Fallback)
 * ======================================================
 */

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoGeoService {

    // ======================================================
    // [의존성 주입 구성]
    // ======================================================
    private final KakaoConfig kakaoConfig;                         // Kakao API Key 설정 주입
    private final RestTemplate restTemplate = createRestTemplate(); // 외부 HTTP 통신용 객체

    // Kakao Local API 엔드포인트
    private static final String ADDRESS_URL = "https://dapi.kakao.com/v2/local/search/address.json";
    private static final String KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

    // ======================================================
    // [RestTemplate 초기 설정]
    // ======================================================
    private RestTemplate createRestTemplate() {
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory();
        factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE); // 중복 인코딩 방지
        RestTemplate template = new RestTemplate();
        template.setUriTemplateHandler(factory);
        return template;
    }

    // ======================================================
    // [주소 전처리]
    // ======================================================
    private String cleanAddress(String raw) {
        if (raw == null) return null;
        // 불필요한 행정단위나 괄호 제거
        return raw.replace("제주특별자치도", "")
                .replaceAll("\\(.*?\\)", "") // 괄호 내용 제거
                .replaceAll("\\s+", " ")    // 연속 공백 정리
                .trim();
    }

    /**
     * ==============================================
     * [getCoordinatesAndTownship]
     * : 주소 -> 좌표 + 읍면동 변환 (숙소명 fallback 포함)
     * ==============================================
     */
    public GeoResult getCoordinatesAndTownship(String address, String title) {
        address = cleanAddress(address);
        if (address == null || address.isBlank()) {
            log.warn("[KAKAO] 주소가 비어있습니다.");
            return null;
        }

        // 1️⃣ 기본 주소 검색 시도
        GeoResult result = requestGeoData(address, ADDRESS_URL);

        // 2️⃣ 기본 주소 실패 → 축약 주소 재시도
        if (result == null) {
            String shortAddr = shortenAddress(address);
            log.info("[KAKAO] 기본 주소 실패 → 축약 주소 재시도: {}", shortAddr);
            result = requestGeoData(shortAddr, ADDRESS_URL);
        }

        // 3️⃣ 축약 주소 실패 → 숙소명 기반 검색 (keyword API)
        if (result == null && title != null && !title.isBlank()) {
            log.info("[KAKAO] 축약 주소 실패 → 숙소명 재시도: {}", title);
            result = requestGeoData(title, KEYWORD_URL);
        }

        return result;
    }

    /** ==============================================
     * [Overload]
     * : 주소만 전달받을 때 (숙소명 미사용)
     * ============================================== */
    public GeoResult getCoordinatesAndTownship(String address) {
        return getCoordinatesAndTownship(address, null);
    }

    // ======================================================
    // [축약 주소 생성 로직]
    // ======================================================
    private String shortenAddress(String fullAddr) {
        if (fullAddr == null) return "";
        String[] parts = fullAddr.split(" ");
        if (parts.length <= 2) return fullAddr;
        return String.join(" ", parts[1], parts[2]); // 예: "서귀포시 서호로 68"
    }

    // ======================================================
    // [공통 Kakao API 호출부]
    // ======================================================
    private GeoResult requestGeoData(String query, String baseUrl) {
        try {
            // 1️⃣ 헤더
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoConfig.getApiKey());
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            // 2️⃣ URI 직접 생성 — ⚠️ UriComponentsBuilder 인코딩 비활성화
            String uri = UriComponentsBuilder
                    .fromHttpUrl(baseUrl)
                    .queryParam("query", query)
                    .encode(StandardCharsets.UTF_8) // ✅ 여기서만 인코딩 처리
                    .toUriString();

            // 3️⃣ 요청
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    entity,
                    JsonNode.class
            );

            JsonNode body = response.getBody();
            if (body == null) {
                log.warn("[KAKAO] 응답 body 없음 → {}", query);
                return null;
            }

            // ✅ meta.total_count 확인 (이제 반드시 존재)
            int totalCount = body.path("meta").path("total_count").asInt(0);
            log.info("[KAKAO] 검색 결과 {}건 → {}", totalCount, query);

            if (totalCount == 0 || body.path("documents").isEmpty()) {
                log.warn("[KAKAO] 검색 결과 없음 → {}", query);
                return null;
            }

            // ✅ 첫 번째 결과 파싱
            JsonNode document = body.path("documents").get(0);
            BigDecimal mapx = new BigDecimal(document.path("x").asText());
            BigDecimal mapy = new BigDecimal(document.path("y").asText());

            JsonNode regionNode = document.has("road_address")
                    ? document.path("road_address")
                    : document.path("address");

            String region2 = regionNode.path("region_2depth_name").asText("");
            String region3 = regionNode.path("region_3depth_name").asText("");

            // 읍면동 그룹화
            String townshipName;
            if ("서귀포시".equals(region2) && region3.endsWith("동")) {
                townshipName = "서귀포시내";
            } else if ("제주시".equals(region2) && region3.endsWith("동")) {
                townshipName = "제주시내";
            } else {
                townshipName = region3.isBlank() ? region2 : region3;
            }

            log.info("[KAKAO] 변환 성공 → {}, {}, {}, {}, ({}, {})",
                    query, region2, region3, townshipName, mapx, mapy);

            return new GeoResult(mapx, mapy, townshipName);

        } catch (Exception e) {
            log.error("[KAKAO] 변환 실패: {} ({})", query, e.getMessage());
            return null;
        }
    }


    // ======================================================
    // [JSON 미리보기용 메서드 (Controller에서 호출)]
    // ======================================================
    private final ObjectMapper objectMapper = new ObjectMapper();

    /** 기본 주소 기반 미리보기 */
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

    /** 주소 + 숙소명 기반 미리보기 */
    public String previewGeoJson(String address, String title) {
        GeoResult result = getCoordinatesAndTownship(address, title);
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
