package com.navi.accommodation.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccRankDTO;
import com.navi.accommodation.dto.api.AdminAccListDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.dto.request.AccSearchRequestDTO;
import com.navi.accommodation.dto.response.AccDetailResponseDTO;
import com.navi.accommodation.dto.response.AccListResponseDTO;
import com.navi.accommodation.mapper.AccMapper;
import com.navi.accommodation.repository.AccRepository;
import com.navi.common.config.kakao.GeoResult;
import com.navi.common.config.kakao.KakaoGeoService;
import com.navi.image.domain.Image;
import com.navi.image.repository.ImageRepository;
import com.navi.location.domain.Township;
import com.navi.location.repository.TownshipRepository;
import com.navi.room.repository.RoomRepository;
import com.navi.room.repository.RoomRsvRepository;
import com.navi.room.repository.StockRepository;
import com.navi.user.repository.LogRepository;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AccServiceImpl implements AccService {
    private final AccRepository accRepository;
    private final RoomRepository roomRepository;
    private final TownshipRepository townshipRepository;
    private final ImageRepository imageRepository;
    private final UserRepository userRepository;
    private final LogRepository logRepository;
    private final RoomRsvRepository roomRsvRepository;
    private final StockRepository stockRepository;

    private final KakaoGeoService kakaoGeoService;
    private final AccSyncService accSyncService;

    private final AccMapper accMapper;

    /* === 관리자 전용 CRUD === */
    // 1. 숙소 생성
    @Override
    public Acc createAcc(AdminAccListDTO dto) {
        // 기본 키 생성
        Long nextSeq = accRepository.getNextSeqVal();
        String accId = String.format("ACC%03d", nextSeq);

        try {
            // KakaoGeoService 호출 (숙소명 + 주소 기반)
            GeoResult geo = kakaoGeoService.getCoordinatesAndTownship(dto.getAddress(), dto.getTitle());
            if (geo == null) {
                log.warn("[CREATE_ACC] ❌ KakaoGeo 결과 없음 → {}", dto.getTitle());
                throw new IllegalStateException("Kakao API를 통한 주소 변환에 실패했습니다.");
            }

            // 읍면동 매핑
            Township township = accSyncService.matchTownshipByGeoResult(geo.getTownshipName());
            if (township == null) {
                log.warn("[CREATE_ACC] ⚠️ 읍면동 매핑 실패 → {} (기본값 0 적용)", geo.getTownshipName());
                township = townshipRepository.getReferenceById(0L);
            } else {
                log.info("[CREATE_ACC] ✅ 읍면동 매핑 성공 → {}", township.getTownshipName());
            }

            // 카테고리 보정
            String resolvedCategory = geo.getCategory();
            if (resolvedCategory == null || resolvedCategory.isBlank()) {
                resolvedCategory = dto.getCategory();
            }

            // 숙소 엔티티 생성
            Acc acc = Acc.builder()
                    .accNo(nextSeq)
                    .accId(accId)
                    .title(dto.getTitle())
                    .category(resolvedCategory)
                    .tel(dto.getTel())
                    .address(dto.getAddress())
                    .hasCooking(dto.isHasCooking())
                    .hasParking(dto.isHasParking())
                    .checkInTime(dto.getCheckInTime() != null ? dto.getCheckInTime() : "15:00")
                    .checkOutTime(dto.getCheckOutTime() != null ? dto.getCheckOutTime() : "11:00")
                    .active(dto.isActive())
                    .viewCount(0L)
                    .mapx(geo.getMapx())
                    .mapy(geo.getMapy())
                    .township(township)
                    .createdTime(LocalDateTime.now())
                    .modifiedTime(LocalDateTime.now())
                    .build();

            // 숙소 저장
            acc = accRepository.save(acc);
            log.info("🏨 [CREATE_ACC] 숙소 등록 완료 → {} ({})", acc.getTitle(), acc.getAccId());

            // 이미지 등록 처리
            if (dto.getLocalImagePath() != null && !dto.getLocalImagePath().isBlank()) {
                Image image = Image.builder()
                        .targetType("ACC")
                        .targetId(acc.getAccId())
                        .path(dto.getLocalImagePath())
                        .uuidName(dto.getLocalImagePath())
                        .build();

                imageRepository.save(image);
                log.info("[CREATE_ACC] 🖼️ 숙소 이미지 등록 완료 - {}", dto.getLocalImagePath());
            } else {
                log.info("[CREATE_ACC] 이미지 미등록 - {}", dto.getTitle());
            }

            // 최종 로그 요약
            log.info("""
            ✅ [CREATE_ACC] 숙소 등록 성공
            ├─ 이름: {}
            ├─ 카테고리: {}
            ├─ 읍면동: {}
            ├─ 좌표: ({}, {})
            └─ 이미지: {}
            """,
                    acc.getTitle(),
                    resolvedCategory,
                    township.getTownshipName(),
                    geo.getMapx(),
                    geo.getMapy(),
                    dto.getLocalImagePath() != null ? dto.getLocalImagePath() : "없음"
            );

            return acc;

        } catch (Exception e) {
            log.error("❌ [CREATE_ACC] 숙소 등록 실패 → {} : {}", dto.getTitle(), e.getMessage(), e);
            throw new RuntimeException("숙소 등록 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    // 2. 숙소 수정
    @Override
    public Acc updateAcc(Long accNo, AccRequestDTO dto) {
        Acc acc = accRepository.findById(accNo)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));

        // API 숙소 수정 불가
        if (acc.getContentId() != null) {
            throw new IllegalStateException("API로 받아온 숙소는 수정할 수 없습니다.");
        }
        acc.changeFromRequestDTO(dto);
        return accRepository.save(acc);
    }

    // 3. 숙소 삭제
    @Override
    public void deleteAcc(Long accNo) {
        Acc acc = accRepository.findById(accNo)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));

        // API 숙소 삭제 불가
        if (acc.getContentId() != null) {
            throw new IllegalStateException("API로 받아온 숙소는 삭제할 수 없습니다.");
        }
        // 진행 중인 예약 존재 건수 확인
        long activeCount = roomRsvRepository.countByRoom_Acc_AccNoAndEndDateGreaterThanEqual(accNo, LocalDate.now());
        if (activeCount > 0) {
            throw new IllegalStateException("❌ 진행 중이거나 예정된 예약 " + activeCount + "건이 존재하여 숙소를 삭제할 수 없습니다.");
        }

        // 객실 재고(RoomStock) 일괄 삭제
        stockRepository.deleteAllByRoom_Acc_AccNo(accNo);
        // 객실(Room) 일괄 삭제
        roomRepository.deleteAllByAcc_AccNo(accNo);
        // 숙소(Acc) 삭제
        accRepository.delete(acc);

        log.info("✅ 숙소 및 관련 데이터 삭제 완료 → accNo={}", accNo);
    }

    // 3. 대표 이미지 변경
    @Override
    public void updateMainImage(String accId) {
        log.info("🖼️ [ACC] 대표 이미지 갱신 요청 - accId={}", accId);

        Acc acc = accRepository.findByAccId(accId)
                .orElseThrow(() -> new IllegalArgumentException("숙소를 찾을 수 없습니다: " + accId));

        String imagePath = imageRepository
                .findTopByTargetTypeAndTargetIdOrderByNoAsc("ACC", accId)
                .map(Image::getPath)
                .orElse(null); // 기본 이미지

        acc.updateMainImage(imagePath);
        accRepository.save(acc);

        log.info("✅ [ACC] 대표 이미지 갱신 완료 - accId={}, mainImage={}", accId, imagePath);
    }

    @Override
    public Map<String, Object> getAllAccList(String keyword, Integer sourceType, String activeFilter, int page, int size) {
        log.info("📋 [ADMIN] 숙소 목록 조회 - keyword={}, sourceType={}, activeFilter={}, page={}, size={}",
                keyword, sourceType, activeFilter, page, size);

        int offset = (page - 1) * size;

        List<AdminAccListDTO> list = accMapper.findAllWithFilters(keyword, sourceType, activeFilter, offset, size);
        int total = accMapper.countAllWithFilters(keyword, sourceType, activeFilter);

        Map<String, Object> result = new HashMap<>();
        result.put("data", list);
        result.put("total", total);

        return result;
    }

    /* === 공통 조회 === */
    @Override
    @Transactional(readOnly = true)
    public List<Acc> getAllAcc() {
        return accRepository.findAll();
    }

    /* === 사용자 전용 조회 === */
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> searchAccommodations(AccSearchRequestDTO dto) {
        log.info("🔍 [ACC_SEARCH] 요청 수신 - {}", dto);

        // 프론트 카테고리 → DB 카테고리 변환
        List<String> categories = new ArrayList<>();
        if (dto.getCategoryList() != null) {
            for (String c : dto.getCategoryList()) {
                switch (c) {
                    case "호텔" -> categories.add("호텔");
                    case "리조트/콘도" -> categories.add("콘도, 리조트");
                    case "모텔" -> categories.add("여관, 모텔");
                    case "펜션" -> categories.add("펜션");
                    case "게스트하우스/민박" -> categories.addAll(
                            List.of("게스트하우스", "유스호스텔", "민박", "일반숙박업", "산장,별장", "한옥숙소", "생활숙박업")
                    );
                    case "기타" -> categories.addAll(
                            List.of("숙박", "야영,캠핑장")
                    );
                }
            }
        }

        // 페이지네이션 계산
        int page = dto.getPage() != null ? dto.getPage() : 1;
        int size = dto.getSize() != null ? dto.getSize() : 6;
        int offset = (page - 1) * size;

        //  DB 데이터 조회
        List<AccListResponseDTO> list = accMapper.searchAccommodations(
                dto.getCity(),
                dto.getTownshipName(),
                dto.getTitle(),
                categories,
                dto.getCheckIn() != null ? dto.getCheckIn().toString() : null,
                dto.getCheckOut() != null ? dto.getCheckOut().toString() : null,
                dto.getGuestCount(),
                dto.getRoomCount(),
                dto.getSort(),
                offset,
                size
        );

        // 총 개수 조회
        int total = accMapper.countAccommodations(
                dto.getCity(),
                dto.getTownshipName(),
                dto.getTitle(),
                categories,
                dto.getCheckIn() != null ? dto.getCheckIn().toString() : null,
                dto.getCheckOut() != null ? dto.getCheckOut().toString() : null,
                dto.getGuestCount(),
                dto.getRoomCount()
        );

        log.debug("✅ [ACC_SEARCH] 결과 {}건 / 총 {}", list.size(), total);

        // 응답 포맷 통일 (React 쪽에서 data + total 받도록)
        Map<String, Object> result = new HashMap<>();
        result.put("data", list);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);

        return result;
    }


    @Override
    @Transactional(readOnly = true)
    public AccDetailResponseDTO getAccDetail(String accId) {
        Acc acc = accRepository.findByAccId(accId)
                .orElseThrow(() -> new IllegalArgumentException("숙소를 찾을 수 없습니다."));

        increaseViewCount(accId);   // 조회수 증가

        // 숙소 이미지 리스트
        List<String> accImages = imageRepository
                .findAllByTargetTypeAndTargetId("ACC", acc.getAccId())
                .stream()
                .map(Image::getPath) // DB 저장값 그대로 사용 (/images/acc/uuid.jpg)
                .collect(Collectors.toList());

        if (accImages.isEmpty()) {
            accImages = List.of("/images/acc/default_hotel.jpg");
        }

        log.debug("[ACC_DETAIL] {} 이미지 개수 = {}", acc.getAccId(), accImages.size());

        AccDetailResponseDTO dto = AccDetailResponseDTO.fromEntity(acc);
        dto.setAccImages(accImages);

        return dto;
    }

    @Override
    @Transactional
    public AccDetailResponseDTO getAccDetailByNo(Long accNo) {
        Acc acc = accRepository.findById(accNo)
                .orElseThrow(() -> new IllegalArgumentException("숙소를 찾을 수 없습니다."));

        return AccDetailResponseDTO.fromEntity(acc);
    }


    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void increaseViewCount(String accId) {
        accRepository.findByAccId(accId).ifPresent(acc -> {
            acc.increaseViewCount();
            accRepository.save(acc);
            log.info("[ACC] 조회수 증가 - accId={}, title={}", accId, acc.getTitle());
        });
    }

    @Override
    public List<AccRankDTO> getTop10ByViews() {
        List<Acc> accList = accRepository.findTop10ByOrderByViewCountDesc();

        return accList.stream()
                .map(acc -> AccRankDTO.builder()
                        .id(acc.getAccId())                 // 예: ACC001
                        .name(acc.getTitle())               // 숙소명
                        .region(acc.getTownship().getTownshipName())// 지역명
                        .views(acc.getViewCount())          // 조회수
                        .thumbnailPath(acc.getMainImage())  // 대표 이미지 바로 사용
                        .build())
                .collect(Collectors.toList());
    }
}