//package com.navi.travel.service;
//
//import com.navi.travel.domain.Travel;
//import com.navi.travel.dto.admin.AdminTravelDetailResponseDTO;
//import com.navi.travel.dto.admin.AdminTravelListResponseDTO;
//import com.navi.travel.dto.admin.AdminTravelRequestDTO;
//import com.navi.travel.repository.TravelRepository;
//import com.navi.travel.repository.admin.AdminTravelRepository;
//import jakarta.persistence.EntityNotFoundException;
//import lombok.RequiredArgsConstructor;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.NoSuchElementException;
//
//@Service
//@RequiredArgsConstructor
//@Transactional
//public class AdminTravelServiceImpl implements AdminTravelService {
//
//    private final AdminTravelRepository adminTravelRepository;
//    private final TravelRepository travelRepository;
//
//    // ✅ 1. 관리자 목록 조회
//    @Override
//    @Transactional(readOnly = true)
//    public Page<AdminTravelListResponseDTO> getAdminTravelList(Pageable pageable, String search) {
//        Page<Travel> page;
//
//        if (search != null && !search.trim().isEmpty()) {
//            // ✅ 공백 무시 + 대소문자 무시 검색
//            String keyword = search.trim();
//            page = travelRepository.searchByTitleIgnoringSpaces(keyword, pageable);
//        } else {
//            page = travelRepository.findAll(pageable);
//        }
//
//        return page.map(AdminTravelListResponseDTO::of);
//    }
//
//    // ✅ 2. 관리자 상세 조회
//    @Override
//    @Transactional(readOnly = true)
//    public AdminTravelDetailResponseDTO getAdminTravelDetail(Long travelId) {
//        Travel travel = adminTravelRepository.findById(travelId)
//                .orElseThrow(() -> new EntityNotFoundException("Travel not found with ID: " + travelId));
//
//        return AdminTravelDetailResponseDTO.of(travel);
//    }
//
//    // ✅ 3. 상태 일괄 변경 (최적화)
//    @Override
//    public void updateState(List<Long> ids, Integer state) {
//        if (ids == null || ids.isEmpty()) {
//            throw new IllegalArgumentException("변경할 항목이 없습니다.");
//        }
//
//        List<Long> longIds = ids.stream().map(Long::valueOf).toList();
//        List<Travel> travels = adminTravelRepository.findAllById(longIds);
//        if (travels.isEmpty()) {
//            throw new NoSuchElementException("선택한 여행지를 찾을 수 없습니다.");
//        }
//
//        travels.forEach(t -> t.setState(state));
//        adminTravelRepository.saveAll(travels);
//    }
//
//    /** ✅ 등록 / 수정 */
//    public Travel saveOrUpdateTravel(AdminTravelRequestDTO dto) {
//        Travel travel;
//        LocalDateTime now = LocalDateTime.now();
//
//        if (dto.getTravelId() != null) {
//            System.out.println("🔵 수정모드: ID=" + dto.getTravelId());
//            travel = travelRepository.findById(dto.getTravelId())
//                    .orElseThrow(() -> new NoSuchElementException("해당 ID의 여행지를 찾을 수 없습니다."));
//
//            // ✅ 기존 엔티티 업데이트
//            travel.setTitle(dto.getTitle());
//            travel.setCategoryName(dto.getCategoryName());
//            travel.setIntroduction(dto.getIntroduction());
//            travel.setDescription(dto.getDescription());
//            travel.setRegion1Name(dto.getRegion1Name());
//            travel.setRegion2Name(dto.getRegion2Name());
//            travel.setAddress(dto.getAddress());
//            travel.setRoadAddress(dto.getRoadAddress());
//            travel.setLongitude(dto.getLongitude());
//            travel.setLatitude(dto.getLatitude());
//            travel.setImagePath(dto.getImagePath());  // ✅ 대표 이미지 반영
//            travel.setThumbnailPath(
//                    dto.getThumbnailPath() != null
//                            ? dto.getThumbnailPath().replaceAll("\\s+", "")
//                            : null
//            );
//            travel.setTag(dto.getTag());
//            travel.setPhoneNo(dto.getPhoneNo());
//            travel.setHomepage(dto.getHomepage());
//            travel.setParking(dto.getParking());
//            travel.setFee(dto.getFee());
//            travel.setHours(dto.getHours());
//            travel.setState(dto.getState());
//
//            // ✅ 수정 시 updatedAt만 변경
//            travel.setUpdatedAt(now);
//
//        } else {
//            System.out.println("🟢 신규등록모드 (관리자)");
//            // 신규 등록
//            travel = dto.toEntity();
//
//            // ✅ contentId 자동 생성
//            if (travel.getContentId() == null || travel.getContentId().isBlank()) {
//                String newId = generateSequentialAdminContentId();
//                System.out.println("✅ 생성된 contentId = " + newId);
//                travel.setContentId(newId);
//            } else {
//                System.out.println("⚠️ contentId가 이미 있음 = " + travel.getContentId());
//            }
//
//            // ✅ 등록 시 createdAt / updatedAt 둘 다 설정
//            travel.setCreatedAt(now);
//            travel.setUpdatedAt(now);
//        }
//
//        Travel saved = travelRepository.save(travel);
//        System.out.println("💾 저장된 contentId = " + saved.getContentId());
//        return saved;
//    }
//
//    /** ✅ 관리자 전용 contentId 생성 규칙 */
//    private String generateSequentialAdminContentId() {
//        String maxId = travelRepository.findMaxAdminContentId();
//        long nextNumber = 1L;
//
//        if (maxId != null && maxId.startsWith("CONT_")) {
//            try {
//                String numericPart = maxId.substring(5, maxId.length() - 1);
//                nextNumber = Long.parseLong(numericPart) + 1;
//            } catch (Exception e) {
//                System.out.println("⚠️ contentId 파싱 실패: " + e.getMessage());
//            }
//        }
//
//        String newId = String.format("CONT_%017dA", nextNumber);
//        System.out.println("🆕 새 contentId 생성됨: " + newId);
//        return newId;
//    }
//}
