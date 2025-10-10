package com.navi.travel.service;

import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.dto.TravelRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TravelService {
    // API 데이터 저장 및 동기화
    int saveApiData();

    // 여행지 리스트 조회 (필터링, 검색, 페이징 포함)
    Page<TravelListResponseDTO> getTravelList(Pageable pageable, List<String> region2Names, String category,String search, boolean publicOnly);

    // 여행지 상세 정보 조회 (✅ userId 타입: String으로 변경)
    TravelDetailResponseDTO getTravelDetail(Long travelId, String id);

    //여행지 등록 및 수정
    TravelListResponseDTO saveTravel(TravelRequestDTO dto);

    //여행지 삭제
    void deleteTravel(Long travelId);

    // 조회수 증가
    void incrementViews(Long travelId);

    // 좋아요 상태 토글 (✅ userId 타입: String으로 변경)
    boolean  toggleLike(Long travelId, String userId);

    // 북마크 상태 토글 (✅ userId 타입: String으로 변경)
    boolean  toggleBookmark(Long travelId, String userId);



}