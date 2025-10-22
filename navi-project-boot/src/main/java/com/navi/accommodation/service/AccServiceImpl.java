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
import com.navi.user.domain.Log;
import com.navi.user.dto.users.UserSecurityDTO;
import com.navi.user.enums.ActionType;
import com.navi.user.repository.LogRepository;
import com.navi.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AccServiceImpl implements AccService {
    private final AccRepository accRepository;
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
    public List<AccListResponseDTO> searchByName(String name) {
        List<Acc> accList = accRepository.findByTitleContainingIgnoreCase(name);

        return accRepository.findByTitleContainingIgnoreCase(name)
                .stream()
                .map(AccListResponseDTO::fromEntity)
                .toList();
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
                    .viewCount(acc.getViewCount())
                    .build();
        }).toList();
    }

    @Override
    @Transactional
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
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Acc increaseViewCount(String accId) {
        // 숙소 조회 및 조회수 증가
        Acc acc = accRepository.findByAccId(accId)
                .map(accList -> {
                    Acc updatedAcc = accList.increaseViewCount();
                    accRepository.save(updatedAcc);
                    return updatedAcc;
                })
                .orElseThrow(() -> new EntityNotFoundException("숙소를 찾을 수 없습니다. (AccId: " + accId + ")"));

        // SecurityContext 인증 정보 확인
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null) {
            log.warn("⚠️ Authentication 객체가 null입니다. (로그인 안됨)");
            return acc;
        }

        if (!auth.isAuthenticated()) {
            log.warn("⚠️ Authentication은 존재하지만 인증되지 않은 상태입니다.");
            return acc;
        }

        // Principal이 UserSecurityDTO인지 확인
        Object principal = auth.getPrincipal();

        if (principal instanceof UserSecurityDTO userDTO) {
            // DB에서 User 조회
            userRepository.findById(userDTO.getNo()).ifPresentOrElse(user -> {
                // 로그 엔티티 생성
                Log newLog = Log.builder()
                        .user(user)
                        .actionType(ActionType.VIEW_ACCOMMODATION)
                        .targetId(acc.getAccNo())
                        .targetName(acc.getTitle())
                        .build();

                try {
                    logRepository.save(newLog);
                } catch (Exception e) {
                    log.error("🚨 [ERROR] 로그 저장 중 예외 발생: {}", e.getMessage(), e);
                }

            }, () -> log.warn("⚠️ [USER-NOT-FOUND] userRepository.findById({}) 결과 없음", userDTO.getNo()));
        }

        return acc;
    }
}