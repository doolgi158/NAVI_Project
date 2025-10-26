package com.navi.travel.service.internal;

import com.navi.travel.domain.Bookmark;
import com.navi.travel.domain.Like;
import com.navi.travel.domain.Travel;
import com.navi.travel.repository.BookmarkRepository;
import com.navi.travel.repository.LikeRepository;
import com.navi.travel.repository.TravelRepository;
import com.navi.user.domain.Log;
import com.navi.user.domain.User;
import com.navi.user.dto.auth.UserSecurityDTO;
import com.navi.user.enums.ActionType;
import com.navi.user.repository.LogRepository;
import com.navi.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class TravelActionServiceImpl implements TravelActionService {

    private final TravelRepository travelRepository;
    private final LikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final LogRepository logRepository;

    /**
     * ✅ 조회수 증가
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void incrementViews(Long travelId) {
        int updated = travelRepository.incrementViews(travelId);
        if (updated == 0) {
            throw new EntityNotFoundException("여행지를 찾을 수 없습니다. (Travel ID: " + travelId + ")");
        }

        // 조회 로그 기록 추가
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return;

        Object principal = auth.getPrincipal();
        if (principal instanceof UserSecurityDTO userDTO) {
            userRepository.findById(userDTO.getId()).ifPresent(user -> {
                Log log = Log.builder()
                        .user(user)
                        .actionType(ActionType.VIEW_TRAVEL)
                        .targetId(travelId)
                        .targetName("Travel View") // 또는 travelRepository.findById(travelId).get().getTitle()
                        .build();
                logRepository.save(log);
            });
        }
    }

    /**
     * ✅ 좋아요 토글
     */
    @Transactional
    public boolean toggleLike(Long travelId, String userId) {
        if (userId == null || userId.isBlank() || "anonymousUser".equals(userId)) {
            throw new IllegalArgumentException("로그인 후 이용 가능합니다.");
        }

        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new EntityNotFoundException("여행지를 찾을 수 없습니다. (Travel ID: " + travelId + ")"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 사용자입니다. (User ID: " + userId + ")"));

        Optional<Like> existingLike = likeRepository.findByTravelIdAndId(travelId, userId);
        boolean likedBefore = existingLike.isPresent();

        if (likedBefore) {
            likeRepository.deleteByTravelIdAndId(travelId, userId);
            travel.decrementLikesCount(); // ✅ 감소
        } else {
            Like like = new Like(travel, user);
            like.setUserId(userId);
            likeRepository.save(like);
            travel.incrementLikesCount(); // ✅ 증가
        }
        travel.setCounterOnlyChanged(true);

        return !likedBefore;
    }

    /**
     * ✅ 북마크 토글
     */
    @Transactional
    public boolean toggleBookmark(Long travelId, String userId) {
        if (userId == null || userId.isBlank() || "anonymousUser".equals(userId)) {
            throw new IllegalArgumentException("로그인 후 이용 가능합니다.");
        }

        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new EntityNotFoundException("여행지를 찾을 수 없습니다. (Travel ID: " + travelId + ")"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 사용자입니다. (User ID: " + userId + ")"));

        Optional<Bookmark> existingBookmark = bookmarkRepository.findByTravelIdAndId(travelId, userId);
        boolean bookmarkedBefore = existingBookmark.isPresent();

        if (bookmarkedBefore) {
            bookmarkRepository.deleteByTravelIdAndId(travelId, userId);
            travel.decrementBookmarkCount(); // ✅ 감소
        } else {
            Bookmark bookmark = new Bookmark(travel, user);
            bookmark.setUserId(userId);
            bookmarkRepository.save(bookmark);
            travel.incrementBookmarkCount(); // ✅ 증가
        }
        travel.setCounterOnlyChanged(true);

        return !bookmarkedBefore;
    }
}
