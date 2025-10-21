package com.navi.travel.service.internal;

import com.navi.travel.domain.Travel;
import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.repository.BookmarkRepository;
import com.navi.travel.repository.LikeRepository;
import com.navi.travel.repository.TravelRepository;
import com.navi.user.dto.JWTClaimDTO;
import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class TravelQueryServiceImpl implements TravelQueryService {

    private final TravelRepository travelRepository;
    private final LikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final EntityManager em;

    public TravelQueryServiceImpl(
            TravelRepository travelRepository,
            LikeRepository likeRepository,
            BookmarkRepository bookmarkRepository,
            EntityManager em
    ) {
        this.travelRepository = travelRepository;
        this.likeRepository = likeRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.em = em;
    }

    @Override
    public Page<TravelListResponseDTO> getTravelList(Pageable pageable,
                                                     List<String> region2Names,
                                                     String category,
                                                     String search,
                                                     boolean publicOnly,
                                                     String userId) {

        Sort sort = pageable.getSort();
        List<Sort.Order> remainingOrders = new ArrayList<>();
        boolean sortByLikes = false;

        for (Sort.Order order : sort) {
            if (order.getProperty().equalsIgnoreCase("likesCount")) {
                sortByLikes = true;
            } else {
                remainingOrders.add(order);
            }
        }

        Specification<Travel> spec = null;
        boolean noRegionFilter = (region2Names == null || region2Names.isEmpty());
        boolean noCategoryFilter = !StringUtils.hasText(category) || "전체".equalsIgnoreCase(category.trim());
        boolean noSearchFilter = !StringUtils.hasText(search);

        // ✅ 인기순 정렬 (native query)
        if (sortByLikes && noRegionFilter && noCategoryFilter && noSearchFilter) {
            log.info("🔥 [인기순 정렬] likes_count DESC 정렬 실행");

            // ⚠️ 정렬 정보 제거된 Pageable 생성
            Pageable plainPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());

            Page<Object[]> nativePage = travelRepository.findAllOrderByLikesCountNative(plainPageable);
            Page<TravelListResponseDTO> resultPage = nativePage.map(row -> {
                Travel travel = new Travel();
                travel.setTravelId(((Number) row[0]).longValue());
                travel.setTitle((String) row[1]);
                travel.setRegion1Name((String) row[2]);
                travel.setRegion2Name((String) row[3]);
                travel.setThumbnailPath((String) row[4]);
                travel.setLikesCount(((Number) row[5]).longValue());
                return TravelListResponseDTO.of(travel);
            });

            return attachLikesAndBookmarks(resultPage,userId);
        }

        // ✅ 공개 상태 필터
        if (publicOnly) {
            Specification<Travel> publicSpec = (root, query, cb) -> cb.equal(root.get("state"), 1);
            spec = combineSpec(spec, publicSpec);
        }

        // ✅ 지역 필터
        if (!noRegionFilter) {
            List<Specification<Travel>> regionSpecs = region2Names.stream()
                    .filter(StringUtils::hasText)
                    .map(region -> (Specification<Travel>) (root, query, cb) ->
                            cb.equal(cb.lower(root.get("region2Name")), region.trim().toLowerCase()))
                    .collect(Collectors.toList());

            Specification<Travel> regionSpec = regionSpecs.stream()
                    .reduce(null, (cur, next) -> cur == null ? next : cur.or(next));

            if (regionSpec != null) spec = combineSpec(spec, regionSpec);
        }

        // ✅ 카테고리 필터
        if (!noCategoryFilter) {
            String lowerCategory = "%" + category.trim().toLowerCase() + "%";
            Specification<Travel> categorySpec = (root, query, cb) ->
                    cb.like(cb.lower(root.get("categoryName")), lowerCategory);
            spec = combineSpec(spec, categorySpec);
        }

        // ✅ 검색 필터
        if (!noSearchFilter) {
            String lowerSearch = "%" + search.trim().toLowerCase() + "%";
            Specification<Travel> searchSpec = (root, query, cb) ->
                    cb.like(cb.lower(root.get("title")), lowerSearch);
            spec = combineSpec(spec, searchSpec);
        }

        // ✅ 남은 정렬조건 적용
        Sort newSort = Sort.by(remainingOrders);
        Pageable newPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                newSort.isUnsorted() ? Sort.by("travelId").descending() : newSort
        );

        // ✅ 조회 실행
        Page<Travel> travelPage = (spec == null)
                ? travelRepository.findAll(newPageable)
                : travelRepository.findAll(spec, newPageable);

        return attachLikesAndBookmarks(travelPage.map(TravelListResponseDTO::of),userId);
    }

    /** ✅ 상세 조회 */
    @Override
    public TravelDetailResponseDTO getTravelDetail(Long travelId, String userId) {
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new NoSuchElementException("Travel not found with ID: " + travelId));

        em.refresh(travel); // 강제 최신화

        Long likesCount = likeRepository.countByTravelId(travelId);
        Long bookmarkCount = bookmarkRepository.countByTravelId(travelId);

        boolean isLikedByUser = false;
        boolean isBookmarkedByUser = false;

        if (StringUtils.hasText(userId) && !"anonymousUser".equals(userId)) {
            isLikedByUser = likeRepository.existsByTravelIdAndId(travelId, userId);
            isBookmarkedByUser = bookmarkRepository.existsByTravelIdAndId(travelId, userId);
        }

        return TravelDetailResponseDTO.of(travel, likesCount, bookmarkCount, isLikedByUser, isBookmarkedByUser);
    }

    private Specification<Travel> combineSpec(Specification<Travel> current, Specification<Travel> next) {
        return (current == null) ? next : current.and(next);
    }

    /** ✅ 좋아요 / 북마크 수 & 로그인 사용자 상태 반영 */
    private Page<TravelListResponseDTO> attachLikesAndBookmarks(Page<TravelListResponseDTO> pageDto, String userId) {
        if (pageDto.isEmpty()) return pageDto;

        for (TravelListResponseDTO dto : pageDto) {
            Long travelId = dto.getTravelId();
            dto.setLikesCount(likeRepository.countByTravelId(travelId));
            dto.setBookmarkCount(bookmarkRepository.countByTravelId(travelId));

            if (StringUtils.hasText(userId) && !"anonymousUser".equals(userId)) {
                dto.setLikedByUser(likeRepository.existsByTravelIdAndId(travelId, userId));
                dto.setBookmarkedByUser(bookmarkRepository.existsByTravelIdAndId(travelId, userId));
            } else {
                dto.setLikedByUser(false);
                dto.setBookmarkedByUser(false);
            }
        }

        return new PageImpl<>(
                pageDto.getContent(),
                pageDto.getPageable(),
                pageDto.getTotalElements()
        );
    }

}
