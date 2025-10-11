//package com.navi.travel.service.internal;
//
//import com.navi.travel.domain.Travel;
//import com.navi.travel.dto.TravelDetailResponseDTO;
//import com.navi.travel.dto.TravelListResponseDTO;
//import com.navi.travel.repository.BookmarkRepository;
//import com.navi.travel.repository.LikeRepository;
//import com.navi.travel.repository.TravelRepository;
//import jakarta.persistence.EntityManager;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.domain.Sort;
//import org.springframework.data.jpa.domain.Specification;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.util.StringUtils;
//
//import java.util.ArrayList;
//import java.util.List;
//import java.util.NoSuchElementException;
//import java.util.stream.Collectors;
//
//// (여행지 조회 및 검색/필터링)
//@Slf4j
//@Service
//@Transactional(readOnly = true)
//public class TravelQueryServiceImpl implements TravelQueryService{
//    private final TravelRepository travelRepository;
//    private final LikeRepository likeRepository;
//    private final BookmarkRepository bookmarkRepository;
//    private final TravelActionService travelActionService; // 뷰 카운트 증가 위임
//    private final EntityManager em;
//
//    public TravelQueryServiceImpl(
//            TravelRepository travelRepository,
//            LikeRepository likeRepository,
//            BookmarkRepository bookmarkRepository,
//            TravelActionService travelActionService,
//            EntityManager em
//    ) {
//        this.travelRepository = travelRepository;
//        this.likeRepository = likeRepository;
//        this.bookmarkRepository = bookmarkRepository;
//        this.travelActionService = travelActionService;
//        this.em = em;
//    }
//
//    /**
//     * Travel 목록을 조회하고 필터링/정렬 기준에 따라 결과를 반환합니다.
//     */
//    public Page<TravelListResponseDTO> getTravelList(Pageable pageable, List<String> region2Names, String category, String search, boolean publicOnly) {
//
//        Sort sort = pageable.getSort();
//        // 'likesCount' 정렬 옵션이 있는지 확인하고, 있으면 제거한 나머지 정렬 옵션 리스트를 만듭니다.
//        List<Sort.Order> remainingOrders = new ArrayList<>();
//        boolean sortByLikes = false;
//
//        for (Sort.Order order : sort) {
//            if (order.getProperty().equals("likesCount")) {
//                sortByLikes = true;
//                // likesCount는 커스텀 쿼리에서 처리할 것이므로, remainingOrders 리스트에는 추가하지 않습니다.
//            } else {
//                remainingOrders.add(order);
//            }
//        }
//
//        Page<Travel> travelPage = null;
//        Specification<Travel> spec = null;
//
//        // 검색/필터링 조건이 없을 때를 확인합니다.
//        boolean noRegionFilter = (region2Names == null || region2Names.isEmpty());
//        boolean noCategoryFilter = !StringUtils.hasText(category) || "전체".equalsIgnoreCase(category.trim());
//        boolean noSearchFilter = !StringUtils.hasText(search);
//
//        // ------------------------------------------------
//        // 1. 좋아요 순 정렬 (likesCount) 처리
//        // ------------------------------------------------
//        if (sortByLikes && noRegionFilter && noCategoryFilter && noSearchFilter && !publicOnly) {
//            // 필터링/검색 조건 없이 오직 'likesCount' 정렬만 요청되었을 경우, 커스텀 쿼리 사용
//            travelPage = travelRepository.findAllOrderByLikesCount(pageable);
//        } else if (sortByLikes) {
//            // 필터링/검색 조건과 함께 'likesCount' 정렬이 요청되었을 경우, 경고 로그만 남기고 일반 정렬로 대체합니다.
//            log.warn("'likesCount' 정렬은 필터링/검색 조건과 함께 사용할 경우 성능 문제가 있거나 지원되지 않을 수 있습니다. 일반 정렬로 대체합니다.");
//        }
//
//        // ------------------------------------------------
//        // 2. 일반 정렬 및 필터링/검색 처리
//        // ------------------------------------------------
//
//        // publicOnly 필터 적용
//        if (publicOnly) {
//            Specification<Travel> publicSpec = (root, query, criteriaBuilder) ->
//                    criteriaBuilder.equal(root.get("state"), 1);
//            spec = combineSpec(spec, publicSpec);
//        }
//
//        // Region 필터 적용
//        if (!noRegionFilter) {
//            List<Specification<Travel>> regionConditions = region2Names.stream()
//                    .filter(StringUtils::hasText)
//                    .map(regionName -> (Specification<Travel>) (root, query, criteriaBuilder) ->
//                            criteriaBuilder.equal(
//                                    criteriaBuilder.trim(root.get("region2Name")),
//                                    regionName.trim()
//                            )
//                    )
//                    .collect(Collectors.toList());
//
//            if (!regionConditions.isEmpty()) {
//                // or 조건으로 연결합니다.
//                Specification<Travel> regionSpec = regionConditions.stream()
//                        .reduce(null, (current, next) -> current == null ? next : current.or(next));
//
//                if (regionSpec != null) {
//                    spec = combineSpec(spec, regionSpec);
//                }
//            }
//        }
//
//        // Category 필터 적용
//        if (!noCategoryFilter) {
//            final String trimmedCategory = category.trim();
//            final String lowerWildcardCategory = "%" + trimmedCategory.toLowerCase() + "%";
//
//            Specification<Travel> categorySpec = (root, query, criteriaBuilder) ->
//                    criteriaBuilder.like(
//                            criteriaBuilder.lower(root.get("categoryName")),
//                            lowerWildcardCategory
//                    );
//
//            spec = combineSpec(spec, categorySpec);
//        }
//
//        // Search 필터 적용
//        if (!noSearchFilter) {
//            final String trimmedSearch = search.trim();
//            final String lowerWildcardSearch = "%" + trimmedSearch.toLowerCase() + "%";
//
//            Specification<Travel> searchSpec = (root, query, criteriaBuilder) ->
//                    criteriaBuilder.like(
//                            criteriaBuilder.lower(root.get("title")),
//                            lowerWildcardSearch
//                    );
//
//            spec = combineSpec(spec, searchSpec);
//        }
//
//        // 새로운 Pageable 객체 생성 (likesCount 정렬 제거 후 남은 정렬 옵션 적용)
//        Sort newSort = Sort.by(remainingOrders);
//        Pageable newPageable = org.springframework.data.domain.PageRequest.of(
//                pageable.getPageNumber(),
//                pageable.getPageSize(),
//                // 정렬 옵션이 없으면 기본값으로 travelId,desc 적용
//                newSort.isUnsorted() ? Sort.by("travelId").descending() : newSort
//        );
//
//        // travelPage가 null인 경우 (즉, 좋아요 정렬 커스텀 쿼리를 타지 않은 경우)에만 findAll을 호출합니다.
//        if (travelPage == null) {
//            if (spec == null) {
//                // 필터링 조건이 전혀 없는 경우
//                travelPage = travelRepository.findAll(newPageable);
//            } else {
//                // 필터링 조건이 있는 경우
//                travelPage = travelRepository.findAll(spec, newPageable);
//            }
//        }
//
//        // 최종 DTO로 변환 및 좋아요/북마크 카운트 첨부
//        Page<TravelListResponseDTO> pageDto = travelPage.map(TravelListResponseDTO::of);
//        return attachLikesAndBookmarks(pageDto);
//    }
//
//    /**
//     * Travel 상세 정보를 조회합니다.
//     */
//    public TravelDetailResponseDTO getTravelDetail(Long travelId, String id) {
//        Travel travel = travelRepository.findById(travelId)
//                .orElseThrow(() -> new NoSuchElementException("Travel not found with ID: " + travelId));
//
//        // 뷰 카운트 증가 로직을 TravelActionService에 위임
//        travelActionService.incrementViews(travelId);
//
//        // incrementViews가 트랜잭션이 분리되어 있거나(Propagation.REQUIRES_NEW) 현재 트랜잭션에서 동작하더라도
//        // em.refresh를 통해 현재 트랜잭션의 영속성 컨텍스트를 DB의 최신 값으로 동기화합니다.
//        em.refresh(travel);
//
//        // 실시간 좋아요/북마크 카운트 조회
//        Long likesCount = likeRepository.countByTravelId(travelId);
//        Long bookmarkCount = bookmarkRepository.countByTravelId(travelId);
//
//
//        boolean isLikedByUser = false;
//        boolean isBookmarkedByUser = false;
//
//        if (id != null && !id.trim().isEmpty()) {
//            isLikedByUser = likeRepository.existsByTravelIdAndId(travelId, id);
//            isBookmarkedByUser = bookmarkRepository.existsByTravelIdAndId(travelId, id);
//        }
//
//        return TravelDetailResponseDTO.of(travel, likesCount, bookmarkCount, isLikedByUser, isBookmarkedByUser);
//    }
//
//    /**
//     * Specification 구성 헬퍼 메서드: 두 Specification을 'and' 조건으로 결합합니다.
//     */
//    private Specification<Travel> combineSpec(Specification<Travel> currentSpec, Specification<Travel> newSpec) {
//        if (currentSpec == null) {
//            return newSpec;
//        }
//        return currentSpec.and(newSpec);
//    }
//
//    /**
//     * TravelListResponseDTO 리스트에 Likes와 Bookmark 카운트를 Repository에서 조회하여 추가하는 헬퍼 메서드
//     */
//    private Page<TravelListResponseDTO> attachLikesAndBookmarks(Page<TravelListResponseDTO> pageDto) {
//        if (pageDto.isEmpty()) {
//            return pageDto;
//        }
//
//        pageDto.getContent().forEach(dto -> {
//            Long travelId = dto.getTravelId();
//
//            dto.setLikesCount(likeRepository.countByTravelId(travelId));
//            dto.setBookmarkCount(bookmarkRepository.countByTravelId(travelId));
//        });
//
//        return pageDto;
//    }
//}