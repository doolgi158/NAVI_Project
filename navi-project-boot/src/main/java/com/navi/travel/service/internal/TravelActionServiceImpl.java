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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.Optional;

// (좋아요, 북마크, 뷰 증가)
@Service
@Transactional
public class TravelActionServiceImpl implements TravelActionService{
    private final TravelRepository travelRepository;
    private final LikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;

    public TravelActionServiceImpl(
            TravelRepository travelRepository,
            LikeRepository likeRepository,
            BookmarkRepository bookmarkRepository,
            UserRepository userRepository
    ) {
        this.travelRepository = travelRepository;
        this.likeRepository = likeRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.userRepository = userRepository;
    }

    // 조회수 증가 로직
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void incrementViews(Long travelId) {
        int updated = travelRepository.incrementViews(travelId);
        if (updated == 0) {
            throw new EntityNotFoundException("Travel not found: " + travelId);
        }
    }

    // toggleLike 메서드
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
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));


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
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));



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
}