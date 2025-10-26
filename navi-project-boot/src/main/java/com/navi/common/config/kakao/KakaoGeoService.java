package com.navi.common.config.kakao;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/* =========================[KakaoGeoService]=========================
     Kakao Local API를 이용한 숙소명 → 좌표 + 읍면동 + 카테고리 변환 서비스
   =================================================================== */

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoGeoService {
    private final KakaoConfig kakaoConfig;  // Kakao API Key 설정 주입
    private final RestTemplate restTemplate = createRestTemplate(); // 외부 HTTP 통신용 객체

    // Kakao Local API 엔드포인트
    private static final String ADDRESS_URL = "https://dapi.kakao.com/v2/local/search/address.json";
    private static final String KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

    /* RestTemplate 초기 설정 */
    private RestTemplate createRestTemplate() {
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory();
        factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE); // 중복 인코딩 방지
        RestTemplate template = new RestTemplate();
        template.setUriTemplateHandler(factory);
        return template;
    }

    /* 주소 전처리 */
    private String cleanAddress(String raw) {
        if (raw == null) return null;
        // 불필요한 행정단위나 괄호 제거
        return raw.replace("제주특별자치도", "")
                .replaceAll("\\(.*?\\)", "")    // 괄호 내용 제거
                .replaceAll("\\s+", " ")        // 연속 공백 정리
                .trim();
    }

    /* 주소 -> 좌표 + 읍면동 + 카테고리 변환 */
    public GeoResult getCoordinatesAndTownship(String address, String title) {
        // 숙소명 기반 검색 (keyword API)
        if (title != null && !title.isBlank()) {
            log.info("[KAKAO] 숙소명 기반 검색 시작 → {}", title);
            GeoResult result = requestGeoData(title, KEYWORD_URL);
            if (result != null) return result;
        }

        // 숙소명 검색 실패 -> 기본 주소 검색 시도
        address = cleanAddress(address);
        if (address == null || address.isBlank()) {
            log.warn("[KAKAO] 주소가 비어있습니다.");
            return null;
        }
        GeoResult result = requestGeoData(address, ADDRESS_URL);

        // 기본 주소 실패 → 축약 주소 재시도
        if (result == null) {
            String shortAddr = shortenAddress(address);
            log.info("[KAKAO] 기본 주소 실패 → 축약 주소 재시도: {}", shortAddr);
            result = requestGeoData(shortAddr, ADDRESS_URL);
        }

        return result;
    }

    /* 주소만 전달받을 때 (숙소명 미사용) */
    public GeoResult getCoordinatesAndTownship(String address) {
        return getCoordinatesAndTownship(address, null);
    }

    /* 축약 주소 생성 로직 */
    private String shortenAddress(String fullAddr) {
        if (fullAddr == null) return "";
        String[] parts = fullAddr.split(" ");

        if (parts.length <= 2) return fullAddr;
        return String.join(" ", parts[1], parts[2]); // 예: "서귀포시 서호로 68"
    }

    /* 공통 Kakao API 호출부 */
    private GeoResult requestGeoData(String query, String baseUrl) {
        try {
            // 요청 헤더
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoConfig.getApiKey());
            headers.set("KA", "sdk/1.0 os/java lang/ko device/pc");
            headers.set("User-Agent", "sdk/1.0 os/java lang/ko device/pc");
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            // 요청 URL 생성 — 한글 인코딩 안전 처리
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            StringBuilder uriBuilder = new StringBuilder(baseUrl + "?query=" + encodedQuery);

            // keyword 검색일 때만 적용
            if (baseUrl.equals(KEYWORD_URL)) {
                //uriBuilder.append("&category_group_code=AD5");        // 숙박(AD5) 카테고리 한정
                uriBuilder.append("&rect=126.10,33.10,126.98,33.62");   // 제주지역 한정
            }
            String uri = uriBuilder.toString();

            // 요청 후 결과 파싱
            ResponseEntity<JsonNode> response = restTemplate.exchange(uriBuilder.toString(), HttpMethod.GET, entity, JsonNode.class);
            JsonNode body = response.getBody();

            if (body == null || !body.has("documents") || body.path("documents").isEmpty()) {
                log.warn("[KAKAO] 검색 결과 없음 → {}", query);
                return null;
            }

            // 숙박 카테고리 필터링
            JsonNode selected = null;
            String category = null;
            for (JsonNode doc : body.path("documents")) {
                String rawCategory = doc.path("category_name").asText("");

                log.info("[KAKAO] Raw category_name: {}", rawCategory);


                if (rawCategory != null && !rawCategory.isBlank()) {
                    String[] parts = rawCategory.split(">");

                    // '숙박' 위치 탐색
                    int lodgingIndex = -1;
                    for (int i = 0; i < parts.length; i++) {
                        if (parts[i].trim().equals("숙박")) {
                            lodgingIndex = i;
                            break;
                        }
                    }

                    // 숙박이 포함되어 있을 경우
                    if (lodgingIndex != -1) {
                        // 숙박 다음 항목이 존재하면 → 그게 세부 카테고리
                        if (lodgingIndex + 1 < parts.length) {
                            category = parts[lodgingIndex + 1].trim();
                        } else {
                            category = "숙박";
                        }
                        selected = doc;
                        break;
                    }
                }
            }

            // 숙박 결과 없으면 좌표는 사용, 카테고리는 null 저장
            if (selected == null) {
                log.warn("[KAKAO] 숙박 관련 결과 없음 → 좌표만 사용 (category=null)");
                selected = body.path("documents").get(0);
                category = null;
            }

            // 좌표 추출
            BigDecimal mapx = new BigDecimal(selected.path("x").asText());
            BigDecimal mapy = new BigDecimal(selected.path("y").asText());

            // 읍면동 정보 추출
            JsonNode regionNode = selected.has("road_address")
                    ? selected.path("road_address")
                    : selected.path("address");

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

            // 결과 반환
            log.info("[KAKAO] 변환 성공 → query={}, township={}, category={}, coords=({}, {})",
                    query, townshipName, category, mapx, mapy);

            return new GeoResult(mapx, mapy, townshipName, category);

        } catch (Exception e) {
            log.error("[KAKAO] 변환 실패: {} ({})", query, e.getMessage());
            return null;
        }
    }

    /* JSON 미리보기용 메서드 (Controller 에서 호출) */
    private final ObjectMapper objectMapper = new ObjectMapper();

    /* 기본 주소 기반 미리보기 */
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

    /* 주소 + 숙소명 기반 미리보기 */
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
