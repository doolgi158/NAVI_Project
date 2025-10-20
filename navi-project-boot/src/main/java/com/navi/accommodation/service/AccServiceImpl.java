package com.navi.accommodation.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.dto.request.AccSearchRequestDTO;
import com.navi.accommodation.dto.response.AccDetailResponseDTO;
import com.navi.accommodation.dto.response.AccListResponseDTO;
import com.navi.accommodation.repository.AccRepository;
import com.navi.image.domain.Image;
import com.navi.image.repository.ImageRepository;
import com.navi.location.repository.TownshipRepository;
import com.navi.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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

    /* === 관리자 전용 CRUD === */
    @Override
    public Acc createAcc(AccRequestDTO dto) {
        Long nextSeq = accRepository.getNextSeqVal(); // ✅ Oracle 시퀀스 호출
        String accId = String.format("ACC%03d", nextSeq);

        Acc acc = Acc.builder()
                .accNo(nextSeq)
                .accId(accId)
                .build();
        acc.changeFromRequestDTO(dto);
        return accRepository.save(acc);
    }

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

    @Override
    public void deleteAcc(Long accNo) {
        Acc acc = accRepository.findById(accNo)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));

        // API 숙소 삭제 불가
        if (acc.getContentId() != null) {
            throw new IllegalStateException("API로 받아온 숙소는 삭제할 수 없습니다.");
        }
        // 예약사항이 있으면 삭제 불가
        if (!acc.isDeletable()) {
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
        List<Acc> accList = accRepository.findAll();

        // 검색 조건 분기
        if (dto.getTownshipName() != null && !dto.getTownshipName().isBlank()) {
            accList = accList.stream()
                    .filter(a -> a.getTownship() != null &&
                            a.getTownship().getTownshipName().contains(dto.getTownshipName()))
                    .toList();
        } else if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            String lowerKeyword = dto.getTitle().toLowerCase();
            accList = accList.stream()
                    .filter(a -> a.getTitle() != null && a.getTitle().toLowerCase().contains(lowerKeyword))
                    .toList();
        } else {
            accList = accRepository.findAll(); // TODO: 명소 기반 검색 추가 예정
        }

        /* 숙소 + 이미지 DTO 조합 */
        return accList.stream().map(acc -> {
            // ✅ 대표 이미지 경로 (/images/acc/uuid.jpg)
            String accImagePath = imageRepository
                    .findTopByTargetTypeAndTargetIdOrderByNoAsc("ACC", acc.getAccId().trim())
                    .map(Image::getPath)
                    .orElse("/images/acc/default_hotel.jpg"); // ✅ 기본 이미지도 동일 구조로 변경

            // ✅ 로그로 실제 반환 확인
            log.debug("[ACC_IMAGE] {} → {}", acc.getAccId(), accImagePath);

            return AccListResponseDTO.builder()
                    .accId(acc.getAccId())
                    .title(acc.getTitle())
                    .address(acc.getAddress())
                    .accImage(accImagePath)
                    .build();
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AccDetailResponseDTO getAccDetail(String accId) {
        Acc acc = accRepository.findByAccId(accId)
                .orElseThrow(() -> new IllegalArgumentException("숙소를 찾을 수 없습니다."));

        // ✅ 숙소 이미지 리스트
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
}
