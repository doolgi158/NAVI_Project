package com.navi.travel.service;

import com.navi.travel.domain.Travel;
import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.dto.TravelRankDTO;
import com.navi.travel.dto.TravelRequestDTO;
import com.navi.travel.repository.TravelRepository;
import com.navi.travel.service.internal.TravelActionService;
import com.navi.travel.service.internal.TravelAdminService;
import com.navi.travel.service.internal.TravelQueryService;
import com.navi.travel.service.internal.TravelSyncService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

/**
 * ✅ TravelServiceImpl
 * 여행지 도메인의 퍼사드(Facade) 역할을 수행.
 * 내부 기능을 분리된 서비스 계층(Internal Services)에 위임하여 관리.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class TravelServiceImpl implements TravelService {

    private final TravelSyncService travelSyncService;
    private final TravelActionService travelActionService;
    private final TravelQueryService travelQueryService;
    private final TravelAdminService travelAdminService;
    private final TravelRepository travelRepository;

    public TravelServiceImpl(
            TravelSyncService travelSyncService,
            TravelActionService travelActionService,
            TravelQueryService travelQueryService,
            TravelAdminService travelAdminService, TravelRepository travelRepository
    ) {
        this.travelSyncService = travelSyncService;
        this.travelActionService = travelActionService;
        this.travelQueryService = travelQueryService;
        this.travelAdminService = travelAdminService;
        this.travelRepository = travelRepository;
    }

    // =====================================================
    // ✅ 1. API 동기화 관련
    // =====================================================

    /** 외부 API 전체 동기화 */
    @Override
    @Transactional
    public void syncTravelData() {
        log.info("🔄 [Sync] 외부 여행지 API 동기화 시작");
        travelSyncService.syncTravelData();
        log.info("✅ [Sync] 여행지 API 동기화 완료");
    }

    /** 외부 API 데이터 저장 */
    @Override
    @Transactional
    public int saveApiData() {
        log.info("📥 [Sync] 여행지 API 데이터 수집 시작");
        int count = travelSyncService.saveApiData();
        log.info("✅ [Sync] 총 {}건의 여행지 데이터 저장 완료", count);
        return count;
    }

    // =====================================================
    // ✅ 2. 조회 및 검색 (Query)
    // =====================================================

    /** 여행지 목록 조회 (필터링 + 검색 + 페이징) */
    @Override
    public Page<TravelListResponseDTO> getTravelList(Pageable pageable, List<String> region2Names,
                                                     String category, String search, boolean publicOnly) {
        log.debug("📄 [Query] 여행지 목록 조회 - page={}, category={}, search={}", pageable.getPageNumber(), category, search);
        return travelQueryService.getTravelList(pageable, region2Names, category, search, publicOnly);
    }

    /** 여행지 상세 조회 */
    @Override
    public TravelDetailResponseDTO getTravelDetail(Long travelId, String id) {
        log.debug("🔍 [Query] 여행지 상세 조회 - travelId={}, userId={}", travelId, id);
        return travelQueryService.getTravelDetail(travelId, id);
    }

    // =====================================================
    // ✅ 3. Action (조회수, 좋아요, 북마크)
    // =====================================================

    /** 조회수 증가 */
    @Override
    @Transactional
    public void incrementViews(Long travelId) {
        log.debug("👁 [Action] 조회수 증가 요청 - travelId={}", travelId);
        travelActionService.incrementViews(travelId);
    }

    /** 좋아요 토글 */
    @Override
    @Transactional
    public boolean toggleLike(Long travelId, String id) {
        log.debug("❤️ [Action] 좋아요 토글 요청 - travelId={}, userId={}", travelId, id);
        return travelActionService.toggleLike(travelId, id);
    }

    /** 북마크 토글 */
    @Override
    @Transactional
    public boolean toggleBookmark(Long travelId, String id) {
        log.debug("📚 [Action] 북마크 토글 요청 - travelId={}, userId={}", travelId, id);
        return travelActionService.toggleBookmark(travelId, id);
    }

    @Override
    public List<TravelRankDTO> getTop10FeaturedTravels() {
        return travelRepository.findAll().stream()
                .map(TravelRankDTO::fromEntity)
                .sorted(Comparator
                        .comparingLong(TravelRankDTO::getScore).reversed()
                        .thenComparing(TravelRankDTO::getTitle))
                .limit(10)
                .toList();
    }

    // =====================================================
    // ✅ 4. 관리자 기능 (등록 / 수정 / 삭제)
    // =====================================================

    /** 여행지 등록 및 수정 */
    @Override
    @Transactional
    public TravelListResponseDTO saveTravel(TravelRequestDTO dto) {
        log.info("✏️ [Admin] 여행지 저장 요청 - title={}, id={}", dto.getTitle(), dto.getTravelId());
        return travelAdminService.saveTravel(dto);
    }

    /** 여행지 삭제 */
    @Override
    @Transactional
    public void deleteTravel(Long travelId) {
        log.warn("🗑 [Admin] 여행지 삭제 요청 - travelId={}", travelId);
        travelAdminService.deleteTravel(travelId);
    }
}
