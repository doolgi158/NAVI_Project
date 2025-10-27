//package com.navi.travel.service;
//
//import com.navi.travel.domain.Travel;
//import com.navi.travel.dto.*;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//
//import java.util.List;
//
//public interface TravelService {
//    // ---------------------- API 동기화 ----------------------
//    void syncTravelData();
//
//    // API 데이터 저장 및 동기화
//    int saveApiData();
//
//    //여행지 리스트 기본 조회
//    List<Travel> getTravelList();
//
//    // 여행지 리스트 조회 (필터링, 검색, 페이징 포함)
//    Page<TravelListResponseDTO> getTravelList(Pageable pageable, List<String> region2Names, String category,String search, boolean publicOnly,String userId);
//
//    // 여행지 상세 정보 조회 (✅ userId 타입: String으로 변경)
//    TravelDetailResponseDTO getTravelDetail(Long travelId, String id);
//
//    // planner 여행지 리스트 조회
//    List<TravelSimpleResponseDTO> getSimpleTravelList();
//
//    //여행지 등록 및 수정
//    TravelListResponseDTO saveTravel(TravelRequestDTO dto);
//
//    //여행지 삭제
//    void deleteTravel(Long travelId);
//
//    // 조회수 증가
//    void incrementViews(Long travelId);
//
//    // 좋아요 상태 토글 (✅ userId 타입: String으로 변경)
//    boolean  toggleLike(Long travelId, String userId);
//
//    // 북마크 상태 토글 (✅ userId 타입: String으로 변경)
//    boolean  toggleBookmark(Long travelId, String userId);
//
//    // 메인 대표 여행지 10개
//    List<TravelRankDTO> getTop10FeaturedTravels();
//
//
//}