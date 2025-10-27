//package com.navi.travel.service.internal;
//
//import com.navi.travel.domain.Travel;
//import com.navi.travel.dto.TravelApiResponseBody;
//import com.navi.travel.repository.TravelRepository;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.*;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.web.client.HttpStatusCodeException;
//import org.springframework.web.client.RestTemplate;
//import org.springframework.web.util.UriComponentsBuilder;
//
//import java.net.URI;
//import java.nio.charset.StandardCharsets;
//import java.util.List;
//import java.util.Optional;
//
//// (API 동기화)
//@Slf4j
//@Service
//@Transactional
//public class TravelSyncServiceImpl implements TravelSyncService{
//    private final TravelRepository travelRepository;
//    private final RestTemplate restTemplate;
//
//    private static final int TARGET_SYNC_COUNT = 5796; // 상수 유지
//
//    @Value("${url}")
//    private String apiUrl;
//
//    @Value("${apikey}")
//    private String apiKey;
//
//    public TravelSyncServiceImpl(TravelRepository travelRepository, RestTemplate restTemplate) {
//        this.travelRepository = travelRepository;
//        this.restTemplate = restTemplate;
//    }
//
//    public void syncTravelData() {
//        saveApiData();
//    }
//
//    public int saveApiData() {
//        int totalSavedCount = 0;
//        int currentPage = 1;
//        final int pageSize = 100;
//        boolean hasMoreData = true;
//
//        log.info("--- 제주 API 데이터 전체 동기화 시작 (목표 건수: {}, 페이지당 {}개) ---", TARGET_SYNC_COUNT, pageSize);
//
//        while (totalSavedCount < TARGET_SYNC_COUNT && hasMoreData) {
//            TravelApiResponseBody responseBody = fetchTravelDataFromApi(currentPage, pageSize);
//
//            if (responseBody == null || responseBody.getTravelItems() == null || responseBody.getTravelItems().isEmpty()) {
//                log.info("API 응답 데이터 없음 → 동기화 종료");
//                break;
//            }
//
//            List<Travel> travelList;
//            try {
//                travelList = responseBody.toTravelEntities();
//            } catch (Exception e) {
//                log.error("API 응답을 엔티티로 변환 중 예외 발생 (페이지 {}): {}", currentPage, e.getMessage());
//                currentPage++;
//                continue;
//            }
//
//            int pageSavedCount = 0;
//
//            for (Travel newTravel : travelList) {
//                if (totalSavedCount >= TARGET_SYNC_COUNT) {
//                    break;
//                }
//
//                Optional<Travel> existing = travelRepository.findByContentId(newTravel.getContentId());
//                if (existing.isPresent()) {
//                    existing.get().updateFromApi(newTravel);
//                } else {
//                    travelRepository.save(newTravel);
//                }
//
//                totalSavedCount++;
//                pageSavedCount++;
//            }
//
//            log.info("페이지 {} 처리 완료 (이번 페이지 저장: {}, 누적: {})", currentPage, pageSavedCount, totalSavedCount);
//
//            if (responseBody.getTravelItems().size() < pageSize || totalSavedCount >= TARGET_SYNC_COUNT) {
//                hasMoreData = false;
//            }
//            currentPage++;
//        }
//
//        log.info("--- 제주 API 데이터 전체 동기화 완료. 총 {}개의 레코드 처리됨 ---", totalSavedCount);
//        return totalSavedCount;
//    }
//
//    private TravelApiResponseBody fetchTravelDataFromApi(int page, int pageSize) {
//        URI uri = UriComponentsBuilder.fromUriString(apiUrl)
//                .queryParam("apiKey", apiKey)
//                .queryParam("page", page)
//                .queryParam("pageSize", pageSize)
//                .queryParam("dataType", "json")
//                .queryParam("locale", "kr")
//                .encode(StandardCharsets.UTF_8)
//                .build()
//                .toUri();
//
//        log.debug("API Request URI: {}", uri);
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
//        headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Custom Application)");
//        HttpEntity<?> entity = new HttpEntity<>(headers);
//
//        try {
//            ResponseEntity<TravelApiResponseBody> response = restTemplate.exchange(
//                    uri,
//                    HttpMethod.GET,
//                    entity,
//                    TravelApiResponseBody.class
//            );
//
//            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
//                return response.getBody();
//            } else {
//                log.error("API 호출 실패. 상태 코드: {} (페이지: {})", response.getStatusCode(), page);
//                return null;
//            }
//        } catch (HttpStatusCodeException e) {
//            String responseBody = e.getResponseBodyAsString();
//            log.error("API 호출 실패 - HTTP 상태 코드: {} (페이지: {}), 응답 본문: {}",
//                    e.getStatusCode(), page, responseBody.length() > 200 ? responseBody.substring(0, 200) + "..." : responseBody);
//            return null;
//        } catch (Exception e) {
//            log.error("API 호출 중 네트워크/기타 예외 발생 (페이지: {}): {}", page, e.getMessage());
//            return null;
//        }
//    }
//}