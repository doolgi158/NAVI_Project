package com.navi.user.service.user;

import com.navi.travel.domain.Travel;
import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.repository.BookmarkRepository;
import com.navi.travel.repository.LikeRepository;
import com.navi.travel.repository.TravelRepository;
import com.navi.user.domain.Log;
import com.navi.user.domain.User;
import com.navi.user.enums.ActionType;
import com.navi.user.repository.UserLogRepository;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserActivityServiceImpl implements UserActivityService {
    private final LikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final TravelRepository travelRepository;
    private final UserLogRepository userLogRepository;

    // 좋아요한 여행지
    public List<TravelDetailResponseDTO> getLikedTravels(Long userNo) {
        return likeRepository.findByUser_No(userNo).stream()
                .map(like -> TravelDetailResponseDTO.of(like.getTravel()))
                .collect(Collectors.toList());
    }

    // 북마크한 여행지
    public List<TravelDetailResponseDTO> getBookmarkedTravels(Long userNo) {
        return bookmarkRepository.findByUser_No(userNo).stream()
                .map(bm -> TravelDetailResponseDTO.of(bm.getTravel()))
                .collect(Collectors.toList());
    }

    // 좋아요 추가
    @Transactional
    public void likeTravel(Long userNo, Long travelId) {
        User user = userRepository.findById(userNo).orElseThrow();
        Travel travel = travelRepository.findById(travelId).orElseThrow();
        likeRepository.save(new com.navi.travel.domain.Like(null, travel, user, user.getId()));
    }

    // 좋아요 취소
    @Transactional
    public void unlikeTravel(Long userNo, Long travelId) {
        likeRepository.deleteByUser_NoAndTravel_TravelId(userNo, travelId);
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
