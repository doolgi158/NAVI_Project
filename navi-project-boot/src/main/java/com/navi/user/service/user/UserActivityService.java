package com.navi.user.service.user;

//import com.navi.travel.dto.TravelDetailResponseDTO;
//import com.navi.user.dto.users.UserMyPageTravelLikeDTO;
import com.navi.user.enums.ActionType;

import java.util.List;

public interface UserActivityService {
//    List<UserMyPageTravelLikeDTO> getLikedTravels(Long userNo);
//
//    List<TravelDetailResponseDTO> getBookmarkedTravels(Long userNo);

    void unlikeTravel(Long userNo, Long travelId);

    void unmarkTravel(Long userNo, Long travelId);

    void logAction(Long userNo, ActionType type, Long targetId);

    void saveAccViewLog(Long userNo, Long accNo, String accTitle);
}
