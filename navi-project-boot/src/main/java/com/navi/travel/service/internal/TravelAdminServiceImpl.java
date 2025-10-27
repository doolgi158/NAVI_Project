//package com.navi.travel.service.internal;
//
//import com.navi.travel.domain.Travel;
//import com.navi.travel.dto.TravelListResponseDTO;
//import com.navi.travel.dto.TravelRequestDTO;
//import com.navi.travel.repository.TravelRepository;
//import jakarta.persistence.EntityManager;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.NoSuchElementException;
//import java.util.UUID;
//
//// (여행지 CRUD)
//@Slf4j
//@Service
//@Transactional
//public class TravelAdminServiceImpl implements TravelAdminService{
//    private final TravelRepository travelRepository;
//    private final EntityManager em;
//
//    public TravelAdminServiceImpl(TravelRepository travelRepository, EntityManager em) {
//        this.travelRepository = travelRepository;
//        this.em = em;
//    }
//
//    /**
//     * 여행지 정보 저장 또는 수정
//     */
//    public TravelListResponseDTO saveTravel(TravelRequestDTO dto) {
//        Travel travel;
//
//        if (dto.getTravelId() != null) {
//            travel = travelRepository.findById(dto.getTravelId())
//                    .orElseThrow(() -> new NoSuchElementException("Travel not found with ID: " + dto.getTravelId()));
//
//            travel.updateFromRequest(dto);
//
//            travel.setUpdatedAt(LocalDateTime.now());
//
//        } else {
//            if (dto.getContentId() == null || dto.getContentId().trim().isEmpty()) {
//                dto.setContentId("CNTSA_" + UUID.randomUUID().toString());
//
//                Long nextVal;
//                try {
//                    // DB 시퀀스를 사용하여 contentId 자동 생성
//                    String sequenceQuery = "SELECT CNTSA_SEQ.NEXTVAL FROM DUAL"; // Oracle 기준으로 가정
//                    nextVal = ((Number) em.createNativeQuery(sequenceQuery).getSingleResult()).longValue();
//
//                    String formattedId = String.format("CNTSA_%015d", nextVal);
//
//                    dto.setContentId(formattedId);
//                    log.info("새로운 contentId 자동 생성: {}", formattedId);
//                } catch (Exception e) {
//                    log.error("contentId 시퀀스 생성 중 오류 발생. DB 시퀀스(CNTSA_SEQ)와 쿼리를 확인해주세요.", e);
//                    throw new RuntimeException("여행지 contentId 생성 실패.", e);
//                }
//            }
//
//            travel = dto.toEntity();
//        }
//
//        Travel savedTravel = travelRepository.save(travel);
//
//        // 등록 시에는 카운터가 0이므로, 별도의 카운트 조회 없이 DTO로 변환하여 반환
//        return TravelListResponseDTO.of(savedTravel);
//    }
//
//    /**
//     * 여행지 정보 삭제
//     */
//    public void deleteTravel(Long travelId) {
//        if (!travelRepository.existsById(travelId)) {
//            throw new NoSuchElementException("Travel not found with ID: " + travelId);
//        }
//
//        travelRepository.deleteById(travelId);
//    }
//}