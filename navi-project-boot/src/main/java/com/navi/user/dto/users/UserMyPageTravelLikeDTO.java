//package com.navi.user.dto.users;
//
//import com.navi.travel.domain.Travel;
//import lombok.AllArgsConstructor;
//import lombok.Builder;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//@Data
//@Builder
//@NoArgsConstructor
//@AllArgsConstructor
//public class UserMyPageTravelLikeDTO {
//    private Long travelId;
//    private String title;
//    private String region1Name;
//    private String region2Name;
//    private String thumbnailPath;
//    private Long likesCount;
//
//    public static UserMyPageTravelLikeDTO from(Travel travel) {
//        return UserMyPageTravelLikeDTO.builder()
//                .travelId(travel.getTravelId())
//                .title(travel.getTitle())
//                .region1Name(travel.getRegion1Name())
//                .region2Name(travel.getRegion2Name())
//                .thumbnailPath(travel.getThumbnailPath())
//                .likesCount(travel.getLikesCount() != null ? travel.getLikesCount() : 0L)
//                .build();
//    }
//}
