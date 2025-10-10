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
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import java.util.ArrayList;
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
    private final UserRepository userRepository;

    private static final int TARGET_SYNC_COUNT = 5796;


    public TravelServiceImpl(
            TravelRepository travelRepository,
            RestTemplate restTemplate,
            LikeRepository likeRepository,
            BookmarkRepository bookmarkRepository,
            EntityManager em,
            UserRepository userRepository
    ){
        this.travelRepository = travelRepository;
        this.restTemplate = restTemplate;
        this.likeRepository = likeRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.em = em;
        this.userRepository = userRepository;
    }

    @Value("${url}")
    private String apiUrl;

    @Value("${apikey}")
    private String apiKey;

    public void syncTravelData() {
        saveApiData();
    }

    // 조회수 증가 로직
    @Transactional
    public void incrementViews(Long travelId) {
        travelRepository.incrementViews(travelId);
    }

    // toggleLike 메서드
    @Override
    @Transactional
    public boolean toggleLike(Long travelId, String id) {
        // [요구사항 1] 비로그인 사용자 처리
        if (id == null || id.trim().isEmpty()) {
            return false;
        }

        // 1. 여행지 엔티티 조회
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new EntityNotFoundException("여행지를 찾을 수 없습니다. (Travel ID: " + travelId + ")"));

        // 2. User 엔티티 조회
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다. (User ID: " + id + ")"));


        // 3. 기존 좋아요 기록 조회
        Optional<Like> existingLike = likeRepository.findByTravelIdAndId(travelId, id);
        boolean likedBefore = existingLike.isPresent();

        if (likedBefore) {
            // [요구사항 3] 기존 기록이 있으면 삭제 (좋아요 취소)
            likeRepository.deleteByTravelIdAndId(travelId, id);
        } else {
            // [요구사항 2] 기존 기록이 없으면 추가 (좋아요)
            Like newLike = new Like(travel, user);
            likeRepository.save(newLike);
        }

        return !likedBefore;
    }

    // toggleBookmark 메서드
    @Override
    @Transactional
    public boolean toggleBookmark(Long travelId, String id) {
        // [요구사항 1] 비로그인 사용자 처리
        if (id == null || id.trim().isEmpty()) {
            return false;
        }

        // 1. 여행지 엔티티 조회
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new EntityNotFoundException("여행지를 찾을 수 없습니다. (Travel ID: " + travelId + ")"));

        // 2. User 엔티티 조회
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다. (User ID: " + id + ")"));


        // 3. 기존 북마크 기록 조회
        Optional<Bookmark> existingBookmark = bookmarkRepository.findByTravelIdAndId(travelId, id);
        boolean bookmarkedBefore = existingBookmark.isPresent();

        if (bookmarkedBefore) {
            // [요구사항 3] 기존 기록이 있으면 삭제 (북마크 취소)
            bookmarkRepository.deleteByTravelIdAndId(travelId, id);
        } else {
            // [요구사항 2] 기존 기록이 없으면 추가 (북마크)
            Bookmark newBookmark = new Bookmark(travel, user);
            bookmarkRepository.save(newBookmark);
        }

        return !bookmarkedBefore;
    }

    // -------------------------------------------------------------
    // getTravelList 메서드 (정렬 및 카운트 로직 추가)
    // -------------------------------------------------------------
    /**
     * Travel 목록을 조회하고 필터링/정렬 기준에 따라 결과를 반환합니다.
     * Specification.where(null) 대신 초기 null 체크 후 Specification을 구성하는 방식을 사용합니다.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<TravelListResponseDTO> getTravelList(Pageable pageable, List<String> region2Names, String category, String search, boolean publicOnly) {

        Sort sort = pageable.getSort();
        // 'likesCount' 정렬 옵션이 있는지 확인하고, 있으면 제거한 나머지 정렬 옵션 리스트를 만듭니다.
        List<Sort.Order> remainingOrders = new ArrayList<>();
        boolean sortByLikes = false;

        for (Sort.Order order : sort) {
            if (order.getProperty().equals("likesCount")) {
                sortByLikes = true;
                // likesCount는 커스텀 쿼리에서 처리할 것이므로, remainingOrders 리스트에는 추가하지 않습니다.
            } else {
                remainingOrders.add(order);
            }
        }

        Page<Travel> travelPage = null; // 초기화하지 않고, 필요 시점에만 할당
        Specification<Travel> spec = null; // Specification.where(null) 대신 null로 초기화

        // 검색/필터링 조건이 없을 때, 정렬에 따라 최적화된 Repository 메서드를 사용합니다.
        boolean noRegionFilter = (region2Names == null || region2Names.isEmpty());
        boolean noCategoryFilter = !StringUtils.hasText(category) || "전체".equalsIgnoreCase(category.trim());
        boolean noSearchFilter = !StringUtils.hasText(search);

        // ------------------------------------------------
        // 1. 좋아요 순 정렬 (likesCount) 처리
        // ------------------------------------------------
        if (sortByLikes && noRegionFilter && noCategoryFilter && noSearchFilter && !publicOnly) {
            // 필터링/검색 조건 없이 오직 'likesCount' 정렬만 요청되었을 경우, 커스텀 쿼리 사용
            travelPage = travelRepository.findAllOrderByLikesCount(pageable);
        } else if (sortByLikes) {
            // 필터링/검색 조건과 함께 'likesCount' 정렬이 요청되었을 경우,
            // JPA Specification은 좋아요 수 정렬을 지원하기 어렵기 때문에 일반 정렬로 대체합니다.
            log.warn("'likesCount' 정렬은 필터링/검색 조건과 함께 사용할 경우 성능 문제가 있거나 지원되지 않을 수 있습니다. 일반 정렬로 대체합니다.");
        }

        // ------------------------------------------------
        // 2. 일반 정렬 및 필터링/검색 처리
        // ------------------------------------------------

        // Specification 구성 헬퍼 메서드는 아래에서 클래스 레벨로 이동했습니다.

        // publicOnly 필터 적용
        if (publicOnly) {
            Specification<Travel> publicSpec = (root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("state"), 1);
            spec = combineSpec(spec, publicSpec);
        }

        // Region 필터 적용
        if (!noRegionFilter) {
            List<Specification<Travel>> regionConditions = region2Names.stream()
                    .filter(StringUtils::hasText)
                    .map(regionName -> (Specification<Travel>) (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    criteriaBuilder.trim(root.get("region2Name")),
                                    regionName.trim()
                            )
                    )
                    .collect(Collectors.toList());

            if (!regionConditions.isEmpty()) {
                // Specification.where(null)을 사용하지 않고 reduce의 초기값으로 null을 사용하며, or 조건으로 연결합니다.
                Specification<Travel> regionSpec = regionConditions.stream()
                        .reduce(null, (current, next) -> current == null ? next : current.or(next));

                if (regionSpec != null) {
                    spec = combineSpec(spec, regionSpec);
                }
            }
        }

        // Category 필터 적용
        if (!noCategoryFilter) {
            final String trimmedCategory = category.trim();
            final String lowerWildcardCategory = "%" + trimmedCategory.toLowerCase() + "%";

            Specification<Travel> categorySpec = (root, query, criteriaBuilder) ->
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("categoryName")),
                            lowerWildcardCategory
                    );

            spec = combineSpec(spec, categorySpec);
        }

        // Search 필터 적용
        if (!noSearchFilter) {
            final String trimmedSearch = search.trim();
            final String lowerWildcardSearch = "%" + trimmedSearch.toLowerCase() + "%";

            Specification<Travel> searchSpec = (root, query, criteriaBuilder) ->
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("title")),
                            lowerWildcardSearch
                    );

            spec = combineSpec(spec, searchSpec);
        }

        // 새로운 Pageable 객체 생성 (likesCount 정렬 제거 후 남은 정렬 옵션 적용)
        Sort newSort = Sort.by(remainingOrders);
        Pageable newPageable = org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                // 정렬 옵션이 없으면 기본값으로 travelId,desc 적용 (기본 키를 기준으로 최신순 정렬)
                newSort.isUnsorted() ? Sort.by("travelId").descending() : newSort
        );

        // travelPage가 null인 경우 (즉, 좋아요 정렬 커스텀 쿼리를 타지 않은 경우)에만 findAll을 호출합니다.
        if (travelPage == null) {
            if (spec == null) {
                // 필터링 조건이 전혀 없는 경우
                travelPage = travelRepository.findAll(newPageable);
            } else {
                // 필터링 조건이 있는 경우 (null이 아닌 spec 사용)
                travelPage = travelRepository.findAll(spec, newPageable);
            }
        }

        // 최종 DTO로 변환 및 좋아요/북마크 카운트 첨부
        Page<TravelListResponseDTO> pageDto = travelPage.map(TravelListResponseDTO::of);
        return attachLikesAndBookmarks(pageDto);
    }

    /**
     * Specification 구성 헬퍼 메서드
     * 두 Specification을 'and' 조건으로 결합합니다.
     */
    private Specification<Travel> combineSpec(Specification<Travel> currentSpec, Specification<Travel> newSpec) {
        if (currentSpec == null) {
            return newSpec;
        }
        return currentSpec.and(newSpec);
    }

    /**
     * TravelListResponseDTO 리스트에 Likes와 Bookmark 카운트를 Repository에서 조회하여 추가하는 헬퍼 메서드
     */
    private Page<TravelListResponseDTO> attachLikesAndBookmarks(Page<TravelListResponseDTO> pageDto) {
        if (pageDto.isEmpty()) {
            return pageDto;
        }

        pageDto.getContent().forEach(dto -> {
            Long travelId = dto.getTravelId();

            // DTO 필드명 변경에 맞춰 setLikesCount()와 setBookmarkCount() 사용
            dto.setLikesCount(likeRepository.countByTravelId(travelId));
            dto.setBookmarkCount(bookmarkRepository.countByTravelId(travelId));
        });

        return pageDto;
    }
    // -------------------------------------------------------------
    // getTravelList 메서드 수정 끝
    // -------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public TravelDetailResponseDTO getTravelDetail(Long travelId, String id) {
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new NoSuchElementException("Travel not found with ID: " + travelId));

        travelRepository.incrementViews(travelId);

        em.refresh(travel);

        // 실시간 좋아요/북마크 카운트 조회
        Long likesCount = likeRepository.countByTravelId(travelId);
        Long bookmarkCount = bookmarkRepository.countByTravelId(travelId);


        boolean isLikedByUser = false;
        boolean isBookmarkedByUser = false;

        if (id != null && !id.trim().isEmpty()) {
            isLikedByUser = likeRepository.existsByTravelIdAndId(travelId, id);
            isBookmarkedByUser = bookmarkRepository.existsByTravelIdAndId(travelId, id);
        }

        // TravelDetailResponseDTO.of()는 현재 5개의 인수를 받도록 구성되어 있습니다.
        return TravelDetailResponseDTO.of(travel, likesCount, bookmarkCount, isLikedByUser, isBookmarkedByUser);
    }


    @Override
    @Transactional
    public int saveApiData() {
        int totalSavedCount = 0;
        int currentPage = 1;
        final int pageSize = 100;
        boolean hasMoreData = true;

        log.info("--- 제주 API 데이터 전체 동기화 시작 (목표 건수: {}, 페이지당 {}개) ---", TARGET_SYNC_COUNT, pageSize);

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

            int pageSavedCount = 0;

            for (Travel newTravel : travelList) {
                if (totalSavedCount >= TARGET_SYNC_COUNT) {
                    break;
                }

                Optional<Travel> existing = travelRepository.findByContentId(newTravel.getContentId());
                if (existing.isPresent()) {
                    existing.get().updateFromApi(newTravel);
                } else {
                    travelRepository.save(newTravel);
                }

                totalSavedCount++;
                pageSavedCount++;
            }

            log.info("페이지 {} 처리 완료 (이번 페이지 저장: {}, 누적: {})", currentPage, pageSavedCount, totalSavedCount);

            if (responseBody.getTravelItems().size() < pageSize || totalSavedCount >= TARGET_SYNC_COUNT) {
                hasMoreData = false;
            }
            currentPage++;
        }

        log.info("--- 제주 API 데이터 전체 동기화 완료. 총 {}개의 레코드 처리됨 ---", totalSavedCount);
        return totalSavedCount;
    }

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

    @Transactional
    public TravelListResponseDTO saveTravel(TravelRequestDTO dto) {
        Travel travel;

        if (dto.getTravelId() != null) {
            travel = travelRepository.findById(dto.getTravelId())
                    .orElseThrow(() -> new NoSuchElementException("Travel not found with ID: " + dto.getTravelId()));

            travel.updateFromRequest(dto);

        } else {
            if (dto.getContentId() == null || dto.getContentId().trim().isEmpty()) {

                Long nextVal;
                try {
                    String sequenceQuery = "SELECT CNTSA_SEQ.NEXTVAL FROM DUAL";
                    nextVal = ((Number) em.createNativeQuery(sequenceQuery).getSingleResult()).longValue();

                    String formattedId = String.format("CNTSA_%015d", nextVal);

                    dto.setContentId(formattedId);
                    log.info("새로운 contentId 자동 생성: {}", formattedId);
                } catch (Exception e) {
                    log.error("contentId 시퀀스 생성 중 오류 발생. DB 시퀀스(CNTSA_SEQ)와 쿼리를 확인해주세요.", e);
                    throw new RuntimeException("여행지 contentId 생성 실패.", e);
                }
            }

            travel = dto.toEntity();
        }

        Travel savedTravel = travelRepository.save(travel);

        // 등록 시에는 카운터가 0이므로, 별도의 카운트 조회 없이 DTO로 변환하여 반환
        return TravelListResponseDTO.of(savedTravel);
    }

    @Transactional
    public void deleteTravel(Long travelId) {
        if (!travelRepository.existsById(travelId)) {
            throw new NoSuchElementException("Travel not found with ID: " + travelId);
        }

        travelRepository.deleteById(travelId);
    }
}
