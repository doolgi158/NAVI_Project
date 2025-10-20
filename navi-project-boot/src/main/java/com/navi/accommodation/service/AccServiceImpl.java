package com.navi.accommodation.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AdminAccListDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.dto.request.AccSearchRequestDTO;
import com.navi.accommodation.dto.response.AccDetailResponseDTO;
import com.navi.accommodation.dto.response.AccListResponseDTO;
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

import java.util.List;

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

    /* === 관리자 전용 CRUD === */
    @Override
    public Acc createAcc(AdminAccListDTO dto) {
        // Township 조회 (필수)
        var township = townshipRepository.findById(dto.getTownshipId())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 지역 정보입니다."));

        // 엔티티 생성 및 값 주입
        Acc acc = Acc.builder()
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
            // Todo: 임시방편 (이거 말고 관광지 기반 만들어야 함)
            accList = accRepository.findAll();
        }

        /* 숙소 + 이미지 + 객실정보 DTO 조합 */
        return accList.stream().map(acc -> {
            String accImage = imageRepository
                    .findTopByTargetTypeAndTargetIdOrderByNoAsc("ACC", acc.getAccId())
                    .map(Image::getPath)
                    .orElse("/uploads/default_hotel.jpg");

            // TODO: 예약 가능한 객실 중 최저가 계산 (추후 구현)
            return AccListResponseDTO.builder()
                    .accId(acc.getAccId())
                    .title(acc.getTitle())
                    .address(acc.getAddress())
                    .accImage(accImage)
                    .build();
        }).toList();
    }

    @Override
    @Transactional
    public AccDetailResponseDTO getAccDetail(String accId) {
        Acc acc = accRepository.findByAccId(accId)
                .orElseThrow(() -> new IllegalArgumentException("숙소를 찾을 수 없습니다."));

        // 숙소 이미지 리스트
        List<String> accImages = imageRepository.findImagesIgnoreCase("ACC", acc.getAccId())
                .stream()
                .map(Image::getPath)
                .toList();

        log.info("[IMAGE-DEBUG] ACC {} 이미지 조회 결과 = {}", acc.getAccId(),
                imageRepository.findAllByTargetTypeAndTargetIdIgnoreCase("ACC", acc.getAccId()).size());

        // 객실 리스트
        /*List<RoomResponseDTO> roomList = roomRepository.findByAcc_AccId(acc.getAccId())
                .stream()
                .map(RoomResponseDTO::fromEntity)
                .toList();*/

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
            log.info("============================== 조회수 증가!!!!!!!");
        });
    }
}