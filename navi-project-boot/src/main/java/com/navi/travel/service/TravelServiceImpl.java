package com.navi.travel.service;

import com.navi.travel.domain.Travel;
import com.navi.travel.dto.TravelApiResponseBody;
import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.repository.TravelRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class TravelServiceImpl implements TravelService {
    private final TravelRepository travelRepository;
    private final RestTemplate restTemplate;

    public TravelServiceImpl(TravelRepository travelRepository, RestTemplate restTemplate) {
        this.travelRepository = travelRepository;
        this.restTemplate = restTemplate;
    }

    @Value("${url}")
    private String apiUrl;

    @Value("${apikey}")
    private String apiKey;

    public void syncTravelData() {
        saveApiData();
    }

    // -------------------------------------------------------------
    // ⭐️ getTravelList 메서드 수정
    // -------------------------------------------------------------
    @Override
    @Transactional(readOnly = true)
    public Page<TravelListResponseDTO> getTravelList(Pageable pageable, List<String> region2Names, String category) {
        log.info(">>> [TravelService] 필터 요청: Region={}, Category='{}'", region2Names, category);
        // 1. 필터 조건 확인 및 전체 조회
        boolean noRegionFilter = (region2Names == null || region2Names.isEmpty());
        //category 필터가 없거나 "전체"인 경우
        boolean noCategoryFilter = !StringUtils.hasText(category) || "전체".equalsIgnoreCase(category);

        if (noRegionFilter && noCategoryFilter) {
            // 필터 조건이 아예 없으면 전체 목록 반환
            return travelRepository.findAll(pageable).map(TravelListResponseDTO::of);
        }

        // 2. Specification 초기화 (시작점)
        // ⭐️ [Deprecation 수정] Specification.where(null) 대신 중립적인 '항상 참' 조건(criteriaBuilder.conjunction())을 사용합니다.
        Specification<Travel> spec = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

        // 3. 지역 필터링 (region2Name) 적용
        if (!noRegionFilter) {

            // 3-1. 입력된 지역 이름 리스트를 OR Specification 리스트로 변환
            List<Specification<Travel>> regionConditions = region2Names.stream()
                    // 입력 값에 공백이 없는지 확인
                    .filter(StringUtils::hasText)
                    .map(regionName -> (Specification<Travel>) (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    criteriaBuilder.trim(root.get("region2Name")), // DB 필드의 공백 제거
                                    regionName.trim() // 입력된 필터 값의 공백 제거
                            )
                    )
                    .collect(Collectors.toList());

            // 3-2. 모든 지역 조건을 OR로 결합
            if (!regionConditions.isEmpty()) {

                Specification<Travel> regionSpec = regionConditions.stream()
                        .reduce(Specification::or) // List의 모든 조건을 OR로 연결
                        // ⭐️ [Deprecation 수정] Specification.where(null) 대신 중립적인 '항상 참' 조건으로 대체
                        .orElse((root, query, criteriaBuilder) -> criteriaBuilder.conjunction());

                // 3-3. 전체 spec에 지역 필터를 AND로 추가
                spec = spec.and(regionSpec);
            }
        }

        // 4. 카테고리 필터링 (categoryName) 적용
        if (!noCategoryFilter) {

            final String trimmedCategory = category.trim(); // 요청 받은 카테고리 값도 TRIM 처리

            // ⭐️ [로그 추가] 실제 비교에 사용될 값 확인
            log.info(">>> [TravelService] 카테고리 필터 적용: 최종 비교 값='{}'", trimmedCategory);

            // 🚨 최종 수정: 엄격한 'equal' 대신 'like'를 사용하여 미묘한 DB 값 불일치 문제를 해결합니다.
            // DB 카테고리 이름에 요청된 카테고리 이름이 포함되어 있는지 확인합니다.
            final String lowerWildcardCategory = "%" + trimmedCategory.toLowerCase() + "%";

            Specification<Travel> categorySpec = (root, query, criteriaBuilder) ->
                    criteriaBuilder.like(
                            criteriaBuilder.lower(criteriaBuilder.trim(root.get("categoryName"))), // DB 필드를 TRIM 후, 소문자 변환
                            lowerWildcardCategory // 소문자 변환된 요청 값에 와일드카드(%) 추가
                    );


            // 기존 spec에 카테고리 필터를 AND로 추가
            spec = spec.and(categorySpec);
        }

        // 5. Specification이 적용된 findAll 호출 (지역 AND 카테고리)
        Page<Travel> travelPage = travelRepository.findAll(spec, pageable);

        // Travel 엔티티 Page를 DTO Page로 변환
        return travelPage.map(TravelListResponseDTO::of);
    }
    // -------------------------------------------------------------
    // ⭐️ getTravelList 메서드 수정 끝
    // -------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public TravelDetailResponseDTO getTravelDetail(Long travelId) {
        // ... (나머지 메서드 유지)
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new NoSuchElementException("Travel not found with ID: " + travelId));

        return TravelDetailResponseDTO.of(travel);
    }

    @Override
    @Transactional // 쓰기 작업이므로 @Transactional을 유지하거나 명시적으로 적용
    public void incrementViews(Long travelId) {
        travelRepository.findById(travelId)
                .ifPresent(travel -> {
                    // Travel 엔티티의 incrementViews() 메서드가 Null 안전하도록 구현되어 있어야 합니다.
                    travel.incrementViews();
                    // JPA의 변경 감지(Dirty Checking)를 통해 트랜잭션 커밋 시 DB에 반영됩니다.
                });
    }

    /**
     * 전체 API 데이터를 페이지 단위로 모두 가져와 DB에 저장합니다.
     * 특정 카테고리(숙박, 축제/행사)는 제외합니다.
     */
    @Override
    public int saveApiData() {
        int totalSavedCount = 0;
        int currentPage = 1;
        final int pageSize = 100; // 페이지당 100개
        boolean hasMoreData = true;

        log.info("--- 제주 API 데이터 전체 동기화 시작 (페이지당 {}개) ---", pageSize);

        while (hasMoreData) {
            TravelApiResponseBody responseBody = fetchTravelDataFromApi(currentPage, pageSize);

            if (responseBody == null || responseBody.getTravelItems() == null || responseBody.getTravelItems().isEmpty()) {
                log.info("API 응답 데이터 없음 → 동기화 종료");
                break;
            }

            List<Travel> travelList;
            try {
                travelList = responseBody.toTravelEntities();
            } catch (Exception e) {
                log.error("API 응답을 엔티티로 변환 중 예외 발생 (페이지 {}): {}", currentPage, e.getMessage());
                currentPage++;
                continue;
            }

            int pageSavedCount = 0; // ✅ 이번 페이지에서 실제 저장된 건수

            for (Travel newTravel : travelList) {
                // ✅ 반복문 내부에서 목표 건수를 초과하는지 재차 확인
                if (totalSavedCount >= 5796) {
                    break; // 루프 즉시 종료
                }

                //데이터 1건당 SELECT 쿼리 1회와 INSERT 또는 UPDATE 쿼리 1회를 발생
                Optional<Travel> existing = travelRepository.findByContentId(newTravel.getContentId());
                if (existing.isPresent()) {
                    // 엔티티가 이미 존재하는 경우 업데이트
                    existing.get().updateFromApi(newTravel);
                } else {
                    // 새로운 엔티티인 경우 저장
                    travelRepository.save(newTravel);
                }

                totalSavedCount++;
                pageSavedCount++;
            }

            log.info("페이지 {} 처리 완료 (이번 페이지 저장: {}, 누적: {})", currentPage, pageSavedCount, totalSavedCount);

            // ✅ 이번 페이지에서 새로 저장된 게 없으면 더 이상 새 데이터가 없는 것으로 간주하고 종료
            if (pageSavedCount == 0) {
                log.info("새로 저장된 데이터가 없으므로 동기화 종료");
                break;
            }
            currentPage++;
        }

        log.info("--- 제주 API 데이터 전체 동기화 완료. 총 {}개의 레코드 처리됨 ---", totalSavedCount);
        return totalSavedCount;
    }

    /**
     * 지정된 페이지의 여행지 데이터를 API에서 가져옵니다.
     */
    private TravelApiResponseBody fetchTravelDataFromApi(int page, int pageSize) {
        URI uri = UriComponentsBuilder.fromUriString(apiUrl)
                .queryParam("apiKey", apiKey)
                .queryParam("page", page)
                .queryParam("pageSize", pageSize)
                .queryParam("dataType", "json")
                .queryParam("locale", "kr")
                .encode(StandardCharsets.UTF_8)
                .build()
                .toUri();

        log.debug("API Request URI: {}", uri);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
        headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Custom Application)");
        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<TravelApiResponseBody> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    entity,
                    TravelApiResponseBody.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                log.error("API 호출 실패. 상태 코드: {} (페이지: {})", response.getStatusCode(), page);
                return null;
            }
        } catch (HttpStatusCodeException e) {
            String responseBody = e.getResponseBodyAsString();
            log.error("API 호출 실패 - HTTP 상태 코드: {} (페이지: {}), 응답 본문: {}",
                    e.getStatusCode(), page, responseBody.length() > 200 ? responseBody.substring(0, 200) + "..." : responseBody);
            return null;
        } catch (Exception e) {
            log.error("API 호출 중 네트워크/기타 예외 발생 (페이지: {}): {}", page, e.getMessage());
            return null;
        }
    }
}
