package com.navi.travel.service;

import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.dto.TravelRequestDTO;
import com.navi.travel.service.internal.TravelActionService;
import com.navi.travel.service.internal.TravelAdminService;
import com.navi.travel.service.internal.TravelQueryService;
import com.navi.travel.service.internal.TravelSyncServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class TravelServiceImpl implements TravelService {
    // 내부 서비스들을 internal 패키지에서 가져옵니다.
    private final TravelSyncServiceImpl travelSyncService;
    private final TravelActionService travelActionService;
    private final TravelQueryService travelQueryService;
    private final TravelAdminService travelAdminService;

    public TravelServiceImpl(
            TravelSyncServiceImpl travelSyncService,
            TravelActionService travelActionService,
            TravelQueryService travelQueryService,
            TravelAdminService travelAdminService
    ) {
        this.travelSyncService = travelSyncService;
        this.travelActionService = travelActionService;
        this.travelQueryService = travelQueryService;
        this.travelAdminService = travelAdminService;
    }

    // ---------------------- API 동기화 ----------------------
    @Override
    public void syncTravelData() {
        travelSyncService.syncTravelData();
    }

    @Override
    public int saveApiData() {
        return travelSyncService.saveApiData();
    }

    // ---------------------- 조회 및 검색 ----------------------
    @Override
    @Transactional(readOnly = true)
    public Page<TravelListResponseDTO> getTravelList(Pageable pageable, List<String> region2Names, String category, String search, boolean publicOnly) {
        return travelQueryService.getTravelList(pageable, region2Names, category, search, publicOnly);
    }

    @Override
    public TravelDetailResponseDTO getTravelDetail(Long travelId, String id) {
        return travelQueryService.getTravelDetail(travelId, id);
    }

    // ---------------------- Action (좋아요/북마크/조회수) ----------------------
    @Override
    @Transactional
    public void incrementViews(Long travelId) {
        travelActionService.incrementViews(travelId);
    }

    @Override
    @Transactional
    public boolean toggleLike(Long travelId, String id) {
        return travelActionService.toggleLike(travelId, id);
    }

    @Override
    @Transactional
    public boolean toggleBookmark(Long travelId, String id) {
        return travelActionService.toggleBookmark(travelId, id);
    }

    // ---------------------- 관리 (CRUD) ----------------------
    @Override
    @Transactional
    public TravelListResponseDTO saveTravel(TravelRequestDTO dto) {
        return travelAdminService.saveTravel(dto);
    }

    @Override
    @Transactional
    public void deleteTravel(Long travelId) {
        travelAdminService.deleteTravel(travelId);
    }
}
