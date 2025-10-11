package com.navi.travel.service.internal;

import com.navi.travel.domain.Bookmark;
import com.navi.travel.domain.Like;
import com.navi.travel.domain.Travel;
import com.navi.travel.repository.BookmarkRepository;
import com.navi.travel.repository.LikeRepository;
import com.navi.travel.repository.TravelRepository;
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
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

    /**
     * ✅ 조회수 증가
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void incrementViews(Long travelId) {
        int updated = travelRepository.incrementViews(travelId);
        if (updated == 0) {
            throw new EntityNotFoundException("여행지를 찾을 수 없습니다. (Travel ID: " + travelId + ")");
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

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 사용자입니다. (User ID: " + userId + ")"));

        Optional<Like> existingLike = likeRepository.findByTravelIdAndId(travelId, userId);
        boolean likedBefore = existingLike.isPresent();

        if (likedBefore) {
            likeRepository.deleteByTravelIdAndId(travelId, userId);
        } else {
            Like like = new Like(travel, user);
            like.setUserId(userId); // user_id 문자열 컬럼 값 세팅
            likeRepository.save(like);
        }

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

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 사용자입니다. (User ID: " + userId + ")"));

        Optional<Bookmark> existingBookmark = bookmarkRepository.findByTravelIdAndId(travelId, userId);
        boolean bookmarkedBefore = existingBookmark.isPresent();

        if (bookmarkedBefore) {
            bookmarkRepository.deleteByTravelIdAndId(travelId, userId);
        } else {
            Bookmark bookmark = new Bookmark(travel, user);
            bookmark.setUserId(userId);
            bookmarkRepository.save(bookmark);
        }

        return !bookmarkedBefore;
    }
}
