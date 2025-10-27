//package com.navi.travel.service;
//
//import com.navi.travel.domain.Travel;
//import com.navi.travel.dto.admin.AdminTravelDetailResponseDTO;
//import com.navi.travel.dto.admin.AdminTravelListResponseDTO;
//import com.navi.travel.repository.TravelRepository;
//import com.navi.travel.repository.admin.AdminTravelRepository;
//import jakarta.persistence.EntityNotFoundException;
//import lombok.RequiredArgsConstructor;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
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
//        // 검색 조건이 있는 경우
//        if (search != null && !search.trim().isEmpty()) {
//            String keyword = "%" + search.trim() + "%";
//            page = adminTravelRepository.findByTitleContainingIgnoreCaseOrRegion1NameContainingIgnoreCaseOrRegion2NameContainingIgnoreCaseOrTagContainingIgnoreCase(
//                    search, search, search, search, pageable
//            );
//        } else {
//            page = adminTravelRepository.findAll(pageable);
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
//    public void updateState(List<Integer> ids, Integer state) {
//        if (ids == null || ids.isEmpty()) {
//            throw new IllegalArgumentException("변경할 항목이 없습니다.");
//        }
//
//        // Long 변환
//        List<Long> longIds = ids.stream().map(Long::valueOf).toList();
//
//        // ID 목록으로 여행지 조회
//        List<Travel> travels = adminTravelRepository.findAllById(longIds);
//        if (travels.isEmpty()) {
//            throw new NoSuchElementException("선택한 여행지를 찾을 수 없습니다.");
//        }
//
//        // 상태 변경
//        travels.forEach(t -> t.setState(state));
//
//        // 일괄 저장
//        adminTravelRepository.saveAll(travels);
//    }
//}
