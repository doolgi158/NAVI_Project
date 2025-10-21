package com.navi.user.service.user;

import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.repository.BookmarkRepository;
import com.navi.travel.repository.LikeRepository;
import com.navi.travel.repository.TravelRepository;
import com.navi.user.domain.Log;
import com.navi.user.domain.User;
import com.navi.user.dto.users.UserMyPageTravelLikeDTO;
import com.navi.user.enums.ActionType;
import com.navi.user.repository.UserLogRepository;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserActivityServiceImpl implements UserActivityService {
    private final LikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final TravelRepository travelRepository;
    private final UserLogRepository userLogRepository;

    // 좋아요한 여행지
    public List<UserMyPageTravelLikeDTO> getLikedTravels(Long userNo) {
        var likes = likeRepository.findWithTravelByUserNo(userNo);

        return likes.stream()
                .map(like -> UserMyPageTravelLikeDTO.from(like.getTravel()))
                .collect(Collectors.toList());
    }

    // 북마크한 여행지
    public List<TravelDetailResponseDTO> getBookmarkedTravels(Long userNo) {
        return bookmarkRepository.findByUser_No(userNo).stream()
                .map(bm -> TravelDetailResponseDTO.of(bm.getTravel()))
                .collect(Collectors.toList());
    }

    // 좋아요 취소
    @Transactional
    public void unlikeTravel(Long userNo, Long travelId) {
        likeRepository.deleteByUser_NoAndTravel_TravelId(userNo, travelId);
    }

    @Override
    @Transactional
    public void unmarkTravel(Long userNo, Long travelId) {
        bookmarkRepository.deleteByUser_NoAndTravel_TravelId(userNo, travelId);
    }

    @Transactional
    public void logAction(Long userNo, ActionType type, Long targetId) {
        User user = userRepository.findById(userNo)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        Log log = Log.builder()
                .user(user)
                .actionType(type)
                .targetId(targetId)
                .build();

        userLogRepository.save(log);
    }
}
