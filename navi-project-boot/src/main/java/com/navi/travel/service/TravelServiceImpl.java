//package com.navi.travel.service;
//
//import com.navi.travel.domain.Travel;
//import com.navi.travel.dto.TravelApiResponseBody;
//import com.navi.travel.dto.TravelDetailResponseDTO;
//import com.navi.travel.dto.TravelListResponseDTO;
//import com.navi.travel.repository.TravelRepository;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
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
//import java.util.NoSuchElementException;
//import java.util.Optional;
//
//@Slf4j
//@Service
//@Transactional
//public class TravelServiceImpl implements TravelService {
//    private final TravelRepository travelRepository;
//    private final RestTemplate restTemplate;
//
//    public TravelServiceImpl(TravelRepository travelRepository, RestTemplate restTemplate) {
//        this.travelRepository = travelRepository;
//        this.restTemplate = restTemplate;
//    }
//
//    @Value("${url}")
//    private String apiUrl;
//
//    @Value("${apikey}")
//    private String apiKey;
//
//    public void syncTravelData() {
//        saveApiData();
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public Page<TravelListResponseDTO> getTravelList(Pageable pageable) {
//        Page<Travel> travelPage = travelRepository.findAll(pageable);
//        // Travel 엔티티 Page를 DTO Page로 변환
//        return travelPage.map(TravelListResponseDTO::of);
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public TravelDetailResponseDTO getTravelDetail(Long travelId) {
//        Travel travel = travelRepository.findById(travelId)
//                .orElseThrow(() -> new NoSuchElementException("Travel not found with ID: " + travelId));
//
//        return TravelDetailResponseDTO.of(travel);
//    }
//
//    @Override
//    @Transactional // 쓰기 작업이므로 @Transactional을 유지하거나 명시적으로 적용
//    public void incrementViews(Long travelId) {
//        travelRepository.findById(travelId)
//                .ifPresent(travel -> {
//                    // Travel 엔티티의 incrementViews() 메서드가 Null 안전하도록 구현되어 있어야 합니다.
//                    travel.incrementViews();
//                    // JPA의 변경 감지(Dirty Checking)를 통해 트랜잭션 커밋 시 DB에 반영됩니다.
//                });
//    }
//
//    /**
//     * 전체 API 데이터를 페이지 단위로 모두 가져와 DB에 저장합니다.
//     * 특정 카테고리(숙박, 축제/행사)는 제외합니다.
//     */
//    @Override
//    public int saveApiData() {
//        int totalSavedCount = 0;
//        int currentPage = 1;
//        final int pageSize = 100; // 페이지당 100개
//        boolean hasMoreData = true;
//
//        log.info("--- 제주 API 데이터 전체 동기화 시작 (페이지당 {}개) ---", pageSize);
//
//        while (hasMoreData) {
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
//            int pageSavedCount = 0; // ✅ 이번 페이지에서 실제 저장된 건수
//
//            for (Travel newTravel : travelList) {
//                // ✅ 반복문 내부에서 목표 건수를 초과하는지 재차 확인
//                if (totalSavedCount >= 5796) {
//                    break; // 루프 즉시 종료
//                }
//
//                //데이터 1건당 SELECT 쿼리 1회와 INSERT 또는 UPDATE 쿼리 1회를 발생
//                Optional<Travel> existing = travelRepository.findByContentId(newTravel.getContentId());
//                if (existing.isPresent()) {
//                    // 엔티티가 이미 존재하는 경우 업데이트
//                    existing.get().updateFromApi(newTravel);
//                } else {
//                    // 새로운 엔티티인 경우 저장
//                    travelRepository.save(newTravel);
//                }
//
//                totalSavedCount++;
//                pageSavedCount++;
//            }
//
//            log.info("페이지 {} 처리 완료 (이번 페이지 저장: {}, 누적: {})", currentPage, pageSavedCount, totalSavedCount);
//
//            // ✅ 이번 페이지에서 새로 저장된 게 없으면 더 이상 새 데이터가 없는 것으로 간주하고 종료
//            if (pageSavedCount == 0) {
//                log.info("새로 저장된 데이터가 없으므로 동기화 종료");
//                break;
//            }
//            currentPage++;
//        }
//
//        log.info("--- 제주 API 데이터 전체 동기화 완료. 총 {}개의 레코드 처리됨 ---", totalSavedCount);
//        return totalSavedCount;
//    }
//
//    /**
//     * 지정된 페이지의 여행지 데이터를 API에서 가져옵니다.
//     */
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