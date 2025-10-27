//package com.navi.travel.dto;
//
//import com.navi.travel.domain.Travel;
//import lombok.*;
//
//@Getter
//@Setter
//@Builder
//@AllArgsConstructor
//@NoArgsConstructor
//public class TravelRankDTO {
//    private Long travelId;          // 여행지 ID
//    private String title;           // 제목
//    private String categoryName;    // 카테고리
//    private String region1Name;     // 광역지역 (예: 서울특별시)
//    private String region2Name;     // 세부지역 (예: 강남구)
//    private String introduction;    // 요약 소개
//    private String thumbnailPath;   // 썸네일 이미지
//    private String imagePath;       // 메인 이미지
//    private Long views;        // 조회수
//    private Long likesCount;        // 좋아요 수
//    private Long bookmarkCount;     // 북마크 수
//    private Long score;             // 종합 점수 (views + likes + bookmarks)
//
//    /**
//     * ✅ Entity → DTO 변환용 정적 메서드
//     */
//    public static TravelRankDTO fromEntity(Travel travel) {
//        if (travel == null) return null;
//
//        long views = travel.getViews() != null ? travel.getViews() : 0L;
//        long likes = travel.getLikesCount() != null ? travel.getLikesCount() : 0L;
//        long bookmarks = travel.getBookmarkCount() != null ? travel.getBookmarkCount() : 0L;
//
//        return TravelRankDTO.builder()
//                .travelId(travel.getTravelId())
//                .title(travel.getTitle())
//                .categoryName(travel.getCategoryName())
//                .region1Name(travel.getRegion1Name())
//                .region2Name(travel.getRegion2Name())
//                .introduction(travel.getIntroduction())
//                .thumbnailPath(travel.getThumbnailPath())
//                .imagePath(travel.getImagePath())
//                .views(views)
//                .likesCount(likes)
//                .bookmarkCount(bookmarks)
//                .score(views + likes + bookmarks)
//                .build();
//    }
//}
