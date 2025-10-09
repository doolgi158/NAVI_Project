package com.navi.travel.service;

import com.navi.travel.domain.Travel;
import com.navi.travel.domain.Like;
import com.navi.travel.domain.Bookmark;
import com.navi.travel.dto.TravelApiResponseBody;
import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.dto.TravelRequestDTO;
import com.navi.travel.repository.LikeRepository;
import com.navi.travel.repository.TravelRepository;
import com.navi.travel.repository.BookmarkRepository;
import jakarta.persistence.EntityNotFoundException;
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

import jakarta.persistence.EntityManager;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
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
    private final LikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final EntityManager em;

    // API 동기화 목표 건수 (클래스 레벨 상수로 선언하여 코드 가독성 향상)
    private static final int TARGET_SYNC_COUNT = 5796;


    public TravelServiceImpl(
            TravelRepository travelRepository,
            RestTemplate restTemplate,
            LikeRepository likeRepository,
            BookmarkRepository bookmarkRepository,
            EntityManager em
    ){
        this.travelRepository = travelRepository;
        this.restTemplate = restTemplate;
        this.likeRepository = likeRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.em = em;
    }

    @Value("${url}")
    private String apiUrl;

    @Value("${apikey}")
    private String apiKey;

    public void syncTravelData() {
        saveApiData();
    }

    // 조회수 로직
    @Transactional
    public void incrementViews(Long travelId) {
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new NoSuchElementException("여행지 ID를 찾을 수 없습니다: " + travelId));

        // ✅ Dirty Checking을 활용하여 별도의 save() 호출 없이도 트랜잭션 종료 시 반영됨
        travel.setViews(travel.getViews() + 1);
        // travelRepository.save(travel); // Dirty Checking으로 생략 가능하나, 필요시 주석 해제 가능
    }

    @Override
    @Transactional
    public boolean toggleLike(Long travelId, String id) { // ✅ id로 변수명 통일
        // 1. Travel 엔티티 조회 (카운트 업데이트 및 예외 처리를 위해 필요)
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new EntityNotFoundException("여행지를 찾을 수 없습니다. (Travel ID: " + travelId + ")"));

        // 2. Like 기록 조회 (ID 기반)
        Optional<Like> existingLike = likeRepository.findByTravelIdAndId(travelId, id);

        boolean likedBefore = existingLike.isPresent();


        if (likedBefore) {
            // 3. 이미 눌러있으면 → 삭제 (ID 기반 리포지토리 메서드 사용)
            likeRepository.deleteByTravelIdAndId(travelId, id);
            travel.decrementLikes(); // ✅ 엔티티의 decrement/increment 메서드 활용
        } else {
            // 4. 없으면 → 추가 (ID 기반 생성자 사용)
            Like newLike = new Like(travelId, id);
            likeRepository.save(newLike);
            travel.incrementLikes(); // ✅ 엔티티의 decrement/increment 메서드 활용
        }

        // 5. 좋아요 카운트 업데이트 (Travel ID 기반)
        // JPA Entity 메서드를 사용했으므로 DB 쿼리 기반 카운트를 제거하여 성능 개선 및 쿼리 감소
        // long likeCount = likeRepository.countByTravelId(travelId);
        // travel.setLikes(likeCount);
        // travelRepository.save(travel); // Dirty Checking으로 생략 가능

        // ✅ 현재 상태 반환 (true = 새로 추가됨, false = 취소됨)
        return !likedBefore;
    }

    /**
     * ✅ 북마크 토글 (ID 기반 로직으로 수정)
     */
    @Override
    @Transactional
    public boolean toggleBookmark(Long travelId, String id) { // ✅ id로 변수명 통일
        // 1. Travel 엔티티 조회 (카운트 업데이트 및 예외 처리를 위해 필요)
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new EntityNotFoundException("여행지를 찾을 수 없습니다. (Travel ID: " + travelId + ")"));

        // 2. Bookmark 기록 조회 (ID 기반)
        Optional<Bookmark> existingBookmark = bookmarkRepository.findByTravelIdAndId(travelId, id);

        boolean bookmarkedBefore = existingBookmark.isPresent();

        if (bookmarkedBefore) {
            // 3. 이미 눌러있으면 → 삭제 (ID 기반 리포지토리 메서드 사용)
            bookmarkRepository.deleteByTravelIdAndId(travelId, id);
            travel.decrementBookmark(); // ✅ Travel 엔티티에 북마크 카운트 감소 메서드가 있다고 가정하고 호출
        } else {
            // 4. 없으면 → 추가 (ID 기반 생성자 사용)
            Bookmark newBookmark = new Bookmark(travelId, id);
            bookmarkRepository.save(newBookmark);
            travel.incrementBookmark(); // ✅ Travel 엔티티에 북마크 카운트 증가 메서드가 있다고 가정하고 호출
        }

        // 5. 북마크 카운트 업데이트
        // JPA Entity 메서드를 사용했으므로 DB 쿼리 기반 카운트를 제거하여 성능 개선 및 쿼리 감소
        // long bookmarkCount = bookmarkRepository.countByTravelId(travelId);
        // travel.setBookmark(bookmarkCount);
        // travelRepository.save(travel); // Dirty Checking으로 생략 가능

        // ✅ 현재 상태 반환 (true = 새로 추가됨, false = 취소됨)
        return !bookmarkedBefore;
    }


    // -------------------------------------------------------------
    // getTravelList 메서드: Specification 초기화 로직 수정 (where(null) -> not(null))
    // -------------------------------------------------------------
    @Override
    @Transactional(readOnly = true)
    public Page<TravelListResponseDTO> getTravelList(Pageable pageable, List<String> region2Names, String category, String search, boolean publicOnly) {
        // 1. 필터 및 검색 조건 유무 확인
        boolean noRegionFilter = (region2Names == null || region2Names.isEmpty());
        boolean noCategoryFilter = !StringUtils.hasText(category) || "전체".equalsIgnoreCase(category.trim());
        boolean noSearchFilter = !StringUtils.hasText(search);

        // 2. 조건이 아예 없으면 전체 목록 반환 (500 오류 방지) - 로직 그대로 유지
        if (noRegionFilter && noCategoryFilter && noSearchFilter && !publicOnly) {
            // publicOnly가 false(관리자)이고 검색 조건이 없으면 전체 반환
            return travelRepository.findAll(pageable).map(TravelListResponseDTO::of);
        }

        // 3. Specification 초기화 (시작점: 항상 참)
        Specification<Travel> spec = Specification.not(null);

        // ⭐️ 3.1. 공개(state=1) 필터링 적용 (publicOnly가 true일 때만)
        if (publicOnly) {
            Specification<Travel> publicSpec = (root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("state"), 1); // state=1 (공개)
            spec = spec.and(publicSpec);
        }


        // 4. 지역 필터링 (region2Name) 적용
        if (!noRegionFilter) {

            // 4-1. 입력된 지역 이름 리스트를 OR Specification 리스트로 변환
            List<Specification<Travel>> regionConditions = region2Names.stream()
                    .filter(StringUtils::hasText)
                    .map(regionName -> (Specification<Travel>) (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    criteriaBuilder.trim(root.get("region2Name")),
                                    regionName.trim()
                            )
                    )
                    .collect(Collectors.toList());

            // 4-2. 모든 지역 조건을 OR로 결합하여 spec에 AND로 추가
            if (!regionConditions.isEmpty()) {
                Specification<Travel> regionSpec = regionConditions.stream()
                        .reduce(Specification::or)
                        // ✅ Specification.not(null) 사용
                        .orElse(Specification.not(null));

                spec = spec.and(regionSpec);
            }
        }

        // 5. 카테고리 필터링 (categoryName) 적용
        if (!noCategoryFilter) {

            final String trimmedCategory = category.trim();
            final String lowerWildcardCategory = "%" + trimmedCategory.toLowerCase() + "%";

            Specification<Travel> categorySpec = (root, query, criteriaBuilder) ->
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("categoryName")),
                            lowerWildcardCategory
                    );

            spec = spec.and(categorySpec);
        }

        // 6. 제목(title) 부분 일치 검색 필터링 (Search) 적용
        if (!noSearchFilter) {
            final String trimmedSearch = search.trim();
            final String lowerWildcardSearch = "%" + trimmedSearch.toLowerCase() + "%";

            Specification<Travel> searchSpec = (root, query, criteriaBuilder) ->
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("title")),
                            lowerWildcardSearch
                    );

            spec = spec.and(searchSpec);
        }

        // 7. Specification이 적용된 findAll 호출
        Page<Travel> travelPage = travelRepository.findAll(spec, pageable);

        // Travel 엔티티 Page를 DTO Page로 변환
        return travelPage.map(TravelListResponseDTO::of);
    }
    // -------------------------------------------------------------
    //  getTravelList 메서드 수정 끝
    // -------------------------------------------------------------

    @Override
    @Transactional // ✅ 조회수 증가와 상세 정보 조회가 하나의 트랜잭션으로 처리되어야 함
    public TravelDetailResponseDTO getTravelDetail(Long travelId, String id) { // ✅ id 매개변수 유지
        // 1. Travel 엔티티 조회
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new NoSuchElementException("Travel not found with ID: " + travelId));

        // 2. 조회수 증가 로직 (Dirty Checking에 의해 트랜잭션 종료 시 반영됨)
        travel.incrementViews(); // ✅ 엔티티의 incrementViews() 메서드 활용 (더 명확함)

        boolean isLikedByUser = false;
        boolean isBookmarkedByUser = false;

        if (id != null) {
            // 3. 좋아요/북마크 여부 확인 (ID 기반 리포지토리 메서드 사용)
            isLikedByUser = likeRepository.existsByTravelIdAndId(travelId, id);
            isBookmarkedByUser = bookmarkRepository.existsByTravelIdAndId(travelId, id);
        }

        // 4. Travel 엔티티(업데이트된 조회수 포함)와 사용자 상태 정보를 함께 DTO로 변환하여 반환
        return TravelDetailResponseDTO.of(travel, isLikedByUser, isBookmarkedByUser);
    }

    @Override
    @Transactional // ✅ API 동기화 전체를 하나의 트랜잭션으로 처리
    public int saveApiData() {
        int totalSavedCount = 0;
        int currentPage = 1;
        final int pageSize = 100; // 페이지당 100개
        boolean hasMoreData = true;

        log.info("--- 제주 API 데이터 전체 동기화 시작 (목표 건수: {}, 페이지당 {}개) ---", TARGET_SYNC_COUNT, pageSize);

        // ✅ 목표 건수(5796)에 도달할 때까지 반복
        while (totalSavedCount < TARGET_SYNC_COUNT && hasMoreData) {
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

            int pageSavedCount = 0; // 이번 페이지에서 실제 저장(추가/업데이트)된 건수

            for (Travel newTravel : travelList) {
                // ✅ 목표 건수 초과 시, 루프 종료 (while 조건과 함께 이중 안전장치)
                if (totalSavedCount >= TARGET_SYNC_COUNT) {
                    break;
                }

                //데이터 1건당 SELECT 쿼리 1회와 INSERT 또는 UPDATE 쿼리 1회를 발생
                Optional<Travel> existing = travelRepository.findByContentId(newTravel.getContentId());
                if (existing.isPresent()) {
                    // 엔티티가 이미 존재하는 경우 업데이트
                    // ✅ 기존 엔티티의 카운터 필드(views, likes, bookmark)는 유지하고 API 필드만 업데이트
                    existing.get().updateFromApi(newTravel);
                    // save 호출 생략 가능 (Dirty Checking)
                } else {
                    // 새로운 엔티티인 경우 저장 (DB SEQUENCE가 아닌 DTO에서 생성된 ID가 사용됨)
                    travelRepository.save(newTravel);
                }

                totalSavedCount++;
                pageSavedCount++;
            }

            log.info("페이지 {} 처리 완료 (이번 페이지 저장: {}, 누적: {})", currentPage, pageSavedCount, totalSavedCount);

            // ✅ 페이지당 처리된 건수가 pageSize보다 적으면 마지막 페이지로 간주 (종료 조건)
            if (responseBody.getTravelItems().size() < pageSize || totalSavedCount >= TARGET_SYNC_COUNT) {
                hasMoreData = false;
            }
            currentPage++;
        }

        log.info("--- 제주 API 데이터 전체 동기화 완료. 총 {}개의 레코드 처리됨 ---", totalSavedCount);
        return totalSavedCount;
    }

    //지정된 페이지의 여행지 데이터를 API에서 가져옵니다.
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


    //여행지 수정, 등록
    @Transactional
    public TravelListResponseDTO saveTravel(TravelRequestDTO dto) {
        Travel travel;

        // travelId가 존재하면 수정
        if (dto.getTravelId() != null) {
            // 1. 수정 (Update)
            travel = travelRepository.findById(dto.getTravelId())
                    .orElseThrow(() -> new NoSuchElementException("Travel not found with ID: " + dto.getTravelId()));

            // 2. 엔티티 업데이트 (Dirty Checking)
            travel.updateFromRequest(dto);

        } else {
            // 3. 등록 (Create)

            // ✅ travelId 시퀀스 생성 로직을 등록(Create) 조건문 안으로 이동하여 일관성 확보
            // --- TRAVEL_SEQ 자동 생성 로직 시작 (travelId 설정) ---
            Long nextTravelId;
            try {
                // **[DB 쿼리]** TRAVEL_SEQ 시퀀스의 다음 값을 가져옵니다. (Oracle 기준)
                String travelSequenceQuery = "SELECT TRAVEL_SEQ.NEXTVAL FROM DUAL";
                nextTravelId = ((Number) em.createNativeQuery(travelSequenceQuery).getSingleResult()).longValue();

                // 3. DTO에 travelId 설정 (이후 dto.toEntity() 시 Travel 엔티티의 ID로 사용됨)
                // dto.setTravelId(nextTravelId); // ✅ toEntity()에서 사용되지 않으므로 제거 (Travel 엔티티에 @GeneratedValue가 있으므로)
                log.info("새로운 travelId 시퀀스 값 가져오기 (TRAVEL_SEQ): {}", nextTravelId);
            } catch (Exception e) {
                log.error("travelId 시퀀스 생성 중 오류 발생. DB 시퀀스(TRAVEL_SEQ)와 쿼리를 확인해주세요.", e);
                throw new RuntimeException("여행지 travelId 생성 실패.", e);
            }
            // --- TRAVEL_SEQ 자동 생성 로직 끝 ---


            // --- CNTSA_ 시퀀스 자동 생성 로직 시작 (contentId 설정) ---
            // contentId가 null 또는 비어있을 경우에만 시퀀스 값 생성
            if (dto.getContentId() == null || dto.getContentId().trim().isEmpty()) {

                // 1. DB 시퀀스에서 다음 값 가져오기
                Long nextVal;
                try {
                    // **[DB 쿼리]** CNTSA_SEQ 시퀀스의 다음 값을 가져옵니다.
                    String sequenceQuery = "SELECT CNTSA_SEQ.NEXTVAL FROM DUAL";
                    nextVal = ((Number) em.createNativeQuery(sequenceQuery).getSingleResult()).longValue();

                    // 2. CNTSA_000000000000001 형식으로 포맷팅 (총 15자리 일련번호)
                    String formattedId = String.format("CNTSA_%015d", nextVal);

                    // 3. DTO에 contentId 설정
                    dto.setContentId(formattedId);
                    log.info("새로운 contentId 자동 생성: {}", formattedId);
                } catch (Exception e) {
                    log.error("contentId 시퀀스 생성 중 오류 발생. DB 시퀀스(CNTSA_SEQ)와 쿼리를 확인해주세요.", e);
                    throw new RuntimeException("여행지 contentId 생성 실패.", e);
                }
            }
            // --- CNTSA_ 시퀀스 자동 생성 로직 끝 ---

            travel = dto.toEntity();
        }

        // 4. 저장 (JPA save는 C/U를 모두 처리)
        Travel savedTravel = travelRepository.save(travel);

        // 5. 응답 DTO로 변환하여 반환
        return TravelListResponseDTO.of(savedTravel);
    }

    //여행지 삭제
    @Transactional
    public void deleteTravel(Long travelId) {
        // 삭제 대상이 존재하는지 확인
        if (!travelRepository.existsById(travelId)) {
            throw new NoSuchElementException("Travel not found with ID: " + travelId);
        }

        travelRepository.deleteById(travelId);
    }

    // ✅ 좋아요 카운트 감소를 위해 Travel 엔티티의 메서드 호출을 가정하고 추가
    // Travel 엔티티에 이 메서드가 정의되어 있어야 합니다.
    // public void decrementBookmark() { /*... */ }
}