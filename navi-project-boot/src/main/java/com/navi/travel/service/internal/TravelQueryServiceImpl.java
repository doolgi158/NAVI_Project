package com.navi.travel.service.internal;

import com.navi.travel.domain.Travel;
import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.repository.BookmarkRepository;
import com.navi.travel.repository.LikeRepository;
import com.navi.travel.repository.TravelRepository;
import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import com.navi.user.dto.JWTClaimDTO;

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
    public Page<TravelListResponseDTO> getTravelList(Pageable pageable, List<String> region2Names,
                                                     String category, String search, boolean publicOnly) {
        Sort sort = pageable.getSort();
        List<Sort.Order> remainingOrders = new ArrayList<>();
        boolean sortByLikes = false;

        for (Sort.Order order : sort) {
            if (order.getProperty().equals("likesCount")) sortByLikes = true;
            else remainingOrders.add(order);
        }

        Page<Travel> travelPage = null;
        Specification<Travel> spec = null;

        boolean noRegionFilter = (region2Names == null || region2Names.isEmpty());
        boolean noCategoryFilter = !StringUtils.hasText(category) || "전체".equalsIgnoreCase(category.trim());
        boolean noSearchFilter = !StringUtils.hasText(search);

        if (sortByLikes && noRegionFilter && noCategoryFilter && noSearchFilter && !publicOnly) {
            travelPage = travelRepository.findAllOrderByLikesCount(pageable);
        }

        if (publicOnly) {
            Specification<Travel> publicSpec = (root, query, cb) -> cb.equal(root.get("state"), 1);
            spec = combineSpec(spec, publicSpec);
        }

        if (!noRegionFilter) {
            List<Specification<Travel>> regionConditions = region2Names.stream()
                    .filter(StringUtils::hasText)
                    .map(region -> (Specification<Travel>) (root, query, cb) ->
                            cb.equal(cb.trim(root.get("region2Name")), region.trim()))
                    .collect(Collectors.toList());
            if (!regionConditions.isEmpty()) {
                Specification<Travel> regionSpec = regionConditions.stream()
                        .reduce(null, (cur, next) -> cur == null ? next : cur.or(next));
                if (regionSpec != null) spec = combineSpec(spec, regionSpec);
            }
        }

        if (!noCategoryFilter) {
            String lowerCategory = "%" + category.trim().toLowerCase() + "%";
            Specification<Travel> categorySpec = (root, query, cb) ->
                    cb.like(cb.lower(root.get("categoryName")), lowerCategory);
            spec = combineSpec(spec, categorySpec);
        }

        if (!noSearchFilter) {
            String lowerSearch = "%" + search.trim().toLowerCase() + "%";
            Specification<Travel> searchSpec = (root, query, cb) ->
                    cb.like(cb.lower(root.get("title")), lowerSearch);
            spec = combineSpec(spec, searchSpec);
        }

        Sort newSort = Sort.by(remainingOrders);
        Pageable newPageable = org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                newSort.isUnsorted() ? Sort.by("travelId").descending() : newSort
        );

        if (travelPage == null) {
            travelPage = (spec == null) ? travelRepository.findAll(newPageable)
                    : travelRepository.findAll(spec, newPageable);
        }

        return attachLikesAndBookmarks(travelPage.map(TravelListResponseDTO::of));
    }

    /** ✅ 여행지 상세 조회 */
    @Override
    public TravelDetailResponseDTO getTravelDetail(Long travelId, String userId) {
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new NoSuchElementException("Travel not found with ID: " + travelId));

        // ✅ DB로부터 최신값 강제 로드 (조회수 포함)
        em.refresh(travel);

        Long likesCount = likeRepository.countByTravelId(travelId);
        Long bookmarkCount = bookmarkRepository.countByTravelId(travelId);

        boolean isLikedByUser = false;
        boolean isBookmarkedByUser = false;

        log.info("🟦 [Service] travelId={}, userId={}", travelId, userId);

        if (userId != null && !userId.isBlank() && !"anonymousUser".equals(userId)) {
            isLikedByUser = likeRepository.existsByTravelIdAndId(travelId, userId);
            isBookmarkedByUser = bookmarkRepository.existsByTravelIdAndId(travelId, userId);
            log.info("🟩 [Result] Like={}, Bookmark={}", isLikedByUser, isBookmarkedByUser);
        } else {
            log.info("⚠️ 비로그인 사용자");
        }

        return TravelDetailResponseDTO.of(travel, likesCount, bookmarkCount, isLikedByUser, isBookmarkedByUser);
    }

    private Specification<Travel> combineSpec(Specification<Travel> current, Specification<Travel> next) {
        return (current == null) ? next : current.and(next);
    }

    private Page<TravelListResponseDTO> attachLikesAndBookmarks(Page<TravelListResponseDTO> pageDto) {
        if (pageDto.isEmpty()) return pageDto;

        String currentUserId = null;
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof JWTClaimDTO claimDTO) {
                currentUserId = claimDTO.getId();
            }
        } catch (Exception e) {
            log.warn("사용자 인증 정보 조회 실패: {}", e.getMessage());
        }

        for (TravelListResponseDTO dto : pageDto) {
            Long travelId = dto.getTravelId();
            dto.setLikesCount(likeRepository.countByTravelId(travelId));
            dto.setBookmarkCount(bookmarkRepository.countByTravelId(travelId));

            if (StringUtils.hasText(currentUserId) && !"anonymousUser".equals(currentUserId)) {
                dto.setLikedByUser(likeRepository.existsByTravelIdAndId(travelId, currentUserId));
                dto.setBookmarkedByUser(bookmarkRepository.existsByTravelIdAndId(travelId, currentUserId));
            } else {
                dto.setLikedByUser(false);
                dto.setBookmarkedByUser(false);
            }
        }

        return pageDto;
    }
}
