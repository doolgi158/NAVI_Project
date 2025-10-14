package com.navi.accommodation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccApiDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.dto.request.AccSearchRequestDTO;
import com.navi.accommodation.dto.response.AccDetailResponseDTO;
import com.navi.accommodation.dto.response.AccListResponseDTO;
import com.navi.accommodation.repository.AccRepository;
import com.navi.location.domain.Township;
import com.navi.location.repository.TownshipRepository;
import com.navi.room.domain.Room;
import com.navi.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AccServiceImpl implements AccService{
    private final AccRepository accRepository;
    private final RoomRepository roomRepository;
    private final TownshipRepository townshipRepository;

    /* === 관리자 전용 CRUD === */
    @Override
    public Acc createAcc(AccRequestDTO dto) {
        Acc acc = Acc.builder().build();
        acc.changeFromRequestDTO(dto);
        return accRepository.save(acc);
    }

    @Override
    public Acc updateAcc(Long accNo, AccRequestDTO dto) {
        Acc acc = accRepository.findById(accNo)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));

        // API 숙소 수정 불가
        if(acc.getContentId() != null) {
            throw new IllegalStateException("API로 받아온 숙소는 수정할 수 없습니다.");
        }
        acc.changeFromRequestDTO(dto);
        return accRepository.save(acc);
    }

    @Override
    public void deleteAcc(Long accNo) {
        Acc acc = accRepository.findById(accNo)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));

        // API 숙소 삭제 불가
        if(acc.getContentId() != null) {
            throw new IllegalStateException("API로 받아온 숙소는 삭제할 수 없습니다.");
        }
        // 예약사항이 있으면 삭제 불가
        if(!acc.isDeletable()) {
            throw new IllegalStateException("삭제 불가 상태의 숙소입니다.");
        }

        accRepository.delete(acc);
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
    public List<AccListResponseDTO> searchAccommodations(AccSearchRequestDTO dto) {
        List<Acc> accList;

        // 지역 기반 검색
        if(dto.getTownshipName() != null && !dto.getTownshipName().isEmpty()) {
            accList = accRepository.findByTownshipName(dto.getTownshipName());
        }
        // 숙소명 기반 검색
        else if(dto.getTitle() != null && !dto.getTitle().isEmpty()) {
            accList = accRepository.findByTitle(dto.getTitle());
        }
        else {
            // Todo: 임시방편 (이거 말고 관광지 기반 만들어야 함)
            accList = accRepository.findAll();
        }

        // 숙소별 DTO 변환 + 객실 최저가 정보 계산
//        List<AccListResponseDTO> resultList = accList.stream().map(acc -> {
//            // 예약 가능한 객실 조회
//            List<Room> rooms = roomRepository.findByAccAndIsAvailable(acc, true);
//
//            // 예약 가능한 객실 중 최저가
//            Integer minPrice = rooms.isEmpty()
//                    ? null
//                    : rooms.stream().map(Room::getWeekdayFee),min(Integer::compareTo).orElse(null);
//            // 🔸 예약 가능한 객실 수
//            Integer remainingRooms = rooms.size();
//
//            // 🔸 DTO 생성
//            return AccListResponseDTO.builder()
//                    .accId(acc.getAccId())
//                    .title(acc.getTitle())
//                    .address(acc.getAddress())
//                    .accImages(null) // TODO: 이미지 연동 시 수정
//                    .minPrice(minPrice)
//                    .remainingRooms(remainingRooms)
//                    .build();
//        }).toList();
        return accList.stream().map(AccListResponseDTO::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AccDetailResponseDTO getAccDetail(String accId) {
        // TODO: 숙소 + 객실 + 이미지 조합 응답
        Acc acc = accRepository.findByAccId(accId)
                .orElseThrow(() -> new IllegalArgumentException("숙소를 찾을 수 없습니다."));
        return AccDetailResponseDTO.fromEntity(acc);
    }
}