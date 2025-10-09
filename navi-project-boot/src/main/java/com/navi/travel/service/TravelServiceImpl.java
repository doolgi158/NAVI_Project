//package com.navi.travel.service;
//
//import com.navi.travel.domain.Travel;
//import com.navi.travel.domain.Like;
//import com.navi.travel.domain.Bookmark;
//import com.navi.travel.dto.TravelApiResponseBody;
//import com.navi.travel.dto.TravelDetailResponseDTO;
//import com.navi.travel.dto.TravelListResponseDTO;
//import com.navi.travel.repository.LikeRepository;
//import com.navi.travel.repository.TravelRepository;
//import com.navi.travel.repository.BookmarkRepository;
//import jakarta.persistence.EntityNotFoundException;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.jpa.domain.Specification;
//import org.springframework.util.StringUtils;
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
//import java.util.stream.Collectors;
//
//@Slf4j
//@Service
//@Transactional
//public class TravelServiceImpl implements TravelService {
//    private final TravelRepository travelRepository;
//    private final RestTemplate restTemplate;
//    private final LikeRepository likeRepository;
//    private final BookmarkRepository bookmarkRepository;
//    // private final UserRepository userRepository; // ✅ User 엔티티를 직접 참조하지 않으므로 제거
//
//    public TravelServiceImpl(
//            TravelRepository travelRepository,
//            RestTemplate restTemplate,
//            LikeRepository likeRepository,
//            BookmarkRepository bookmarkRepository
//            /* ,UserRepository userRepository */) { // ✅ UserRepository 주입 제거
//        this.travelRepository = travelRepository;
//        this.restTemplate = restTemplate;
//        this.likeRepository = likeRepository;
//        this.bookmarkRepository = bookmarkRepository;
//        // this.userRepository = userRepository; // ✅ 주입 제거
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
//    // 조회수 로직
//    @Transactional
//    public void incrementViews(Long travelId) {
//        Travel travel = travelRepository.findById(travelId)
//                .orElseThrow(() -> new NoSuchElementException("여행지 ID를 찾을 수 없습니다: " + travelId));
//
//        travel.setViews(travel.getViews() + 1);
//        travelRepository.save(travel);
//    }
//
//    @Override
//    @Transactional
//    public boolean toggleLike(Long travelId, String id) { // ✅ id로 변수명 통일
//        // 1. Travel 엔티티 조회 (카운트 업데이트 및 예외 처리를 위해 필요)
//        Travel travel = travelRepository.findById(travelId)
//                .orElseThrow(() -> new EntityNotFoundException("여행지를 찾을 수 없습니다. (Travel ID: " + travelId + ")"));
//
//        // 2. Like 기록 조회 (ID 기반)
//        Optional<Like> existingLike = likeRepository.findByTravelIdAndId(travelId, id);
//
//        boolean likedBefore = existingLike.isPresent();
//
//        if (likedBefore) {
//            // 3. 이미 눌러있으면 → 삭제 (ID 기반 리포지토리 메서드 사용)
//            likeRepository.deleteByTravelIdAndId(travelId, id);
//        } else {
//            // 4. 없으면 → 추가 (ID 기반 생성자 사용)
//            Like newLike = new Like(travelId, id);
//            likeRepository.save(newLike);
//        }
//
//        // 5. 좋아요 카운트 업데이트 (Travel ID 기반)
//        long likeCount = likeRepository.countByTravelId(travelId);
//        travel.setLikes(likeCount);
//        travelRepository.save(travel);
//
//        // ✅ 현재 상태 반환 (true = 새로 추가됨, false = 취소됨)
//        return !likedBefore;
//    }
//
//    /**
//     * ✅ 북마크 토글 (ID 기반 로직으로 수정)
//     */
//    @Override
//    @Transactional
//    public boolean toggleBookmark(Long travelId, String id) { // ✅ id로 변수명 통일
//        // 1. Travel 엔티티 조회 (카운트 업데이트 및 예외 처리를 위해 필요)
//        Travel travel = travelRepository.findById(travelId)
//                .orElseThrow(() -> new EntityNotFoundException("여행지를 찾을 수 없습니다. (Travel ID: " + travelId + ")"));
//
//        // 2. Bookmark 기록 조회 (ID 기반)
//        Optional<Bookmark> existingBookmark = bookmarkRepository.findByTravelIdAndId(travelId, id);
//
//        boolean bookmarkedBefore = existingBookmark.isPresent();
//
//        if (bookmarkedBefore) {
//            // 3. 이미 눌러있으면 → 삭제 (ID 기반 리포지토리 메서드 사용)
//            bookmarkRepository.deleteByTravelIdAndId(travelId, id);
//        } else {
//            // 4. 없으면 → 추가 (ID 기반 생성자 사용)
//            Bookmark newBookmark = new Bookmark(travelId, id);
//            bookmarkRepository.save(newBookmark);
//        }
//
//        // 5. 북마크 카운트 업데이트 (Travel ID 기반)
//        long bookmarkCount = bookmarkRepository.countByTravelId(travelId);
//        travel.setBookmark(bookmarkCount);
//        travelRepository.save(travel);
//
//        // ✅ 현재 상태 반환 (true = 새로 추가됨, false = 취소됨)
//        return !bookmarkedBefore;
//    }
//
//
//    // -------------------------------------------------------------
//    // getTravelList 메서드는 변경 사항이 없으므로 기존 로직 유지
//    // -------------------------------------------------------------
//    @Override
//    @Transactional(readOnly = true)
//    public Page<TravelListResponseDTO> getTravelList(Pageable pageable, List<String> region2Names, String category, String search) {
//
//
//        // 1. 필터 조건 확인 및 전체 조회
//        boolean noRegionFilter = (region2Names == null || region2Names.isEmpty());
//        //category 필터가 없거나 "전체"인 경우
//        boolean noCategoryFilter = !StringUtils.hasText(category) || "전체".equalsIgnoreCase(category);
//        //search 필터가 없는 경우
//        boolean noSearchFilter = !StringUtils.hasText(search);
//
//        if (noRegionFilter && noCategoryFilter && noSearchFilter) {
//            // 필터 조건이 아예 없으면 전체 목록 반환
//            return travelRepository.findAll(pageable).map(TravelListResponseDTO::of);
//        }
//
//        // 2. Specification 초기화 (시작점)
//        //  Specification.where(null) 대신 중립적인 '항상 참' 조건(criteriaBuilder.conjunction())을 사용합니다.
//        Specification<Travel> spec = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
//
//        // 3. 지역 필터링 (region2Name) 적용
//        if (!noRegionFilter) {
//
//            // 3-1. 입력된 지역 이름 리스트를 OR Specification 리스트로 변환
//            List<Specification<Travel>> regionConditions = region2Names.stream()
//                    // 입력 값에 공백이 없는지 확인
//                    .filter(StringUtils::hasText)
//                    .map(regionName -> (Specification<Travel>) (root, query, criteriaBuilder) ->
//                            criteriaBuilder.equal(
//                                    criteriaBuilder.trim(root.get("region2Name")), // DB 필드의 공백 제거
//                                    regionName.trim() // 입력된 필터 값의 공백 제거
//                            )
//                    )
//                    .collect(Collectors.toList());
//
//            // 3-2. 모든 지역 조건을 OR로 결합
//            if (!regionConditions.isEmpty()) {
//
//                Specification<Travel> regionSpec = regionConditions.stream()
//                        .reduce(Specification::or) // List의 모든 조건을 OR로 연결
//                        .orElse((root, query, criteriaBuilder) -> criteriaBuilder.conjunction());
//
//                // 3-3. 전체 spec에 지역 필터를 AND로 추가
//                spec = spec.and(regionSpec);
//            }
//        }
//
//        // 4. 카테고리 필터링 (categoryName) 적용
//        if (!noCategoryFilter) {
//
//            final String trimmedCategory = category.trim(); // 요청 받은 카테고리 값도 TRIM 처리
//
//            log.info(">>> [TravelService] 카테고리 필터 적용: 최종 비교 값='{}'", trimmedCategory);
//
//            // 🚨 최종 수정: 엄격한 'equal' 대신 'like'를 사용하여 미묘한 DB 값 불일치 문제를 해결합니다.
//            // DB 카테고리 이름에 요청된 카테고리 이름이 포함되어 있는지 확인합니다.
//            final String lowerWildcardCategory = "%" + trimmedCategory.toLowerCase() + "%";
//
//            Specification<Travel> categorySpec = (root, query, criteriaBuilder) ->
//                    criteriaBuilder.like(
//                            criteriaBuilder.lower(criteriaBuilder.trim(root.get("categoryName"))), // DB 필드를 TRIM 후, 소문자 변환
//                            lowerWildcardCategory // 소문자 변환된 요청 값에 와일드카드(%) 추가
//                    );
//
//
//            // 기존 spec에 카테고리 필터를 AND로 추가
//            spec = spec.and(categorySpec);
//        }
//
//        //  5. 제목(title) 부분 일치 검색 필터링 (Search) 적용
//        if (!noSearchFilter) {
//            final String trimmedSearch = search.trim();
//            final String lowerWildcardSearch = "%" + trimmedSearch.toLowerCase() + "%";
//
//            Specification<Travel> searchSpec = (root, query, criteriaBuilder) ->
//                    criteriaBuilder.like(
//                            criteriaBuilder.lower(root.get("title")), // title 필드를 소문자 변환
//                            lowerWildcardSearch // 소문자 변환된 검색어에 와일드카드(%) 추가
//                    );
//
//            // 기존 spec에 제목 검색 필터를 AND로 추가 (다른 필터와 함께 적용)
//            spec = spec.and(searchSpec);
//
//            log.info(">>> [TravelService] 제목 검색 필터 적용: 검색어='{}'", trimmedSearch);
//        }
//
//        // 6. Specification이 적용된 findAll 호출 (지역 AND 카테고리 AND 검색어)
//        Page<Travel> travelPage = travelRepository.findAll(spec, pageable);
//
//        // Travel 엔티티 Page를 DTO Page로 변환
//        return travelPage.map(TravelListResponseDTO::of);
//    }
//    // -------------------------------------------------------------
//    //  getTravelList 메서드 수정 끝
//    // -------------------------------------------------------------
//
//    @Override
//    @Transactional(readOnly = true)
//    public TravelDetailResponseDTO getTravelDetail(Long travelId, String id) { // ✅ id 매개변수 추가
//        // 1. Travel 엔티티 조회
//        Travel travel = travelRepository.findById(travelId)
//                .orElseThrow(() -> new NoSuchElementException("Travel not found with ID: " + travelId));
//
//        // TODO: 실제 인증 정보를 가져오는 로직으로 대체해야 합니다.
//        // 현재는 하드코딩된 값(80L)을 사용하거나, 인증 정보가 없으면 null을 사용한다고 가정합니다.
////         String id = "navi38"; // ❌ 하드코딩 제거 (매개변수로 받음)
//
//        boolean isLikedByUser = false;
//        boolean isBookmarkedByUser = false;
//
//        if (id != null) {
//            // 2. 좋아요/북마크 여부 확인 (ID 기반 리포지토리 메서드 사용)
//            isLikedByUser = likeRepository.existsByTravelIdAndId(travelId, id);
//            isBookmarkedByUser = bookmarkRepository.existsByTravelIdAndId(travelId, id);
//        }
//
//        // 3. Travel 엔티티와 사용자 상태 정보를 함께 DTO로 변환하여 반환
//        return TravelDetailResponseDTO.of(travel, isLikedByUser, isBookmarkedByUser);
//    }
//
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
//    //지정된 페이지의 여행지 데이터를 API에서 가져옵니다.
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
