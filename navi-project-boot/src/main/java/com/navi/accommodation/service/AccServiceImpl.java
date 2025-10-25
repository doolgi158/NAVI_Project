package com.navi.accommodation.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AdminAccListDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.dto.request.AccSearchRequestDTO;
import com.navi.accommodation.dto.response.AccDetailResponseDTO;
import com.navi.accommodation.dto.response.AccListResponseDTO;
import com.navi.accommodation.mapper.AccMapper;
import com.navi.accommodation.repository.AccRepository;
import com.navi.image.domain.Image;
import com.navi.image.repository.ImageRepository;
import com.navi.location.repository.TownshipRepository;
import com.navi.room.repository.RoomRepository;
import com.navi.user.repository.LogRepository;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
    private final UserRepository userRepository;
    private final LogRepository logRepository;

    private final AccMapper accMapper;

    /* === 관리자 전용 CRUD === */
    // 1. 숙소 생성
    @Override
    public Acc createAcc(AdminAccListDTO dto) {
        Long nextSeq = accRepository.getNextSeqVal();
        String accId = String.format("ACC%03d", nextSeq);

        // Township 조회 (필수)
        var township = townshipRepository.findById(dto.getTownshipId())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 지역 정보입니다."));

        // 엔티티 생성 및 값 주입
        Acc acc = Acc.builder()
                .accId(accId)
                .title(dto.getTitle())
                .category(dto.getCategory())
                .tel(dto.getTel())
                .address(dto.getAddress())
                .checkInTime(dto.getCheckInTime() != null ? dto.getCheckInTime() : "15:00")
                .checkOutTime(dto.getCheckOutTime() != null ? dto.getCheckOutTime() : "11:00")
                .hasCooking(dto.isHasCooking())
                .hasParking(dto.isHasParking())
                .active(dto.isActive())
                .township(township)
                .createdTime(java.time.LocalDateTime.now())
                .modifiedTime(java.time.LocalDateTime.now())
                .build();

        // 숙소 저장 (1차 저장 — accNo 생성)
        acc = accRepository.save(acc);

        // 로컬 이미지 경로가 있을 경우 이미지 엔티티로 저장
        if (dto.getLocalImagePath() != null && !dto.getLocalImagePath().isBlank()) {
            Image image = Image.builder()
                    .targetType("ACC") // 숙소 이미지
                    .targetId(acc.getAccId())
                    .path(dto.getLocalImagePath()) // 로컬 이미지 경로
                    .uuidName(dto.getLocalImagePath()) // 필요 시 uuidName 필드에 동일하게 저장
                    .build();

            imageRepository.save(image);
            log.info("[ADMIN] 숙소 이미지 등록 완료 - {}", dto.getLocalImagePath());
        }

        log.info("[ADMIN] 숙소 등록 완료 - {}", acc.getTitle());
        return acc;
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
        // 예약사항이 있으면 삭제 불가
        if (!roomRepository.findByAcc_AccNo(accNo).isEmpty()) {
            throw new IllegalStateException("해당 숙소에 예약된 객실이 존재합니다.");
        }

        accRepository.delete(acc);
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
    public List<AdminAccListDTO> getAllAccList(String keyword) {
        List<Acc> accList;

        if (keyword != null && !keyword.isBlank()) {
            accList = accRepository.findByTitleContainingIgnoreCase(keyword);
        } else {
            accList = accRepository.findAll(Sort.by(Sort.Direction.DESC, "accNo"));
        }

        return accList.stream()
                .map(AdminAccListDTO::fromEntity)
                .toList();
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

        // Mapper 기반 DB 검색 수행
        List<AccListResponseDTO> accList = accMapper.searchAccommodations(
                dto.getCity(),
                dto.getTownshipName(),
                dto.getTitle(),
                categories,
                dto.getCheckIn() != null ? dto.getCheckIn() : null,
                dto.getCheckOut() != null ? dto.getCheckOut() : null,
                dto.getGuestCount(),
                dto.getRoomCount(),
                dto.getSort()
        );

        log.debug("✅ [ACC_SEARCH] 결과 {}건", accList.size());

        return accList;
    }


    @Override
    @Transactional(readOnly = true)
    public AccDetailResponseDTO getAccDetail(String accId) {
        Acc acc = accRepository.findByAccId(accId)
                .orElseThrow(() -> new IllegalArgumentException("숙소를 찾을 수 없습니다."));

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
        //dto.setRooms(roomList);

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
    @Transactional
    public void increaseViewCount(String accId) {
        accRepository.findByAccId(accId).ifPresent(acc -> {
            acc.increaseViewCount();
            accRepository.save(acc);
            log.info("[ACC] 조회수 증가 - accId={}, title={}", accId, acc.getTitle());
        });
    }
}