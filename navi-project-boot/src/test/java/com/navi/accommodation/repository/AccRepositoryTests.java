package com.navi.accommodation.repository;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.service.AccService;
import com.navi.accommodation.service.AccSyncService;
import com.navi.location.domain.Township;
import com.navi.location.repository.TownshipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.Optional;

@SpringBootTest
@Slf4j
public class AccRepositoryTests {
<<<<<<< HEAD
    @Autowired private AccRepository accRepository;
    @Autowired private AccService accService;
    @Autowired private AccSyncService accSyncService;
    @Autowired private TownshipRepository townshipRepository;

    /* === API 데이터 적재 === */
    @Test
    public void loadAccData() throws Exception {
        accSyncService.loadApiFromJsonFile();
        log.info("API 데이터 DB 초기 적재 완료");
    }
    @Test
    public void updateAccData() throws Exception {
        accSyncService.updateApiFromJsonFile();
        log.info("API 데이터 DB 초기 업데이트 완료");
    }
    @Test
    public void loadAdminAccData() throws Exception {
        accSyncService.loadFromAdminJsonFile();
        log.info("✅ 관리자 JSON 데이터 추가 적재 완료");
    }

    /* === KakaoGeo 기반 주소 -> 좌표 + 읍면동 동기화 === */
    @Test
    public void updateAllData() {
        accSyncService.updateAll();
        log.info("✅ KakaoGeo 기반 좌표 및 읍면동 전체 동기화 완료");
    }

    /* === 관리자 CRUD === */
    @Test
    public void accInsertTest() {
        Township townshipId = townshipRepository.findById(2L)   // Todo: townshipId 임시값
                .orElseThrow(() -> new IllegalArgumentException("해당 지역을 찾을 수 없습니다."));

        // 필수적으로 명시해줘야 하는 항목 : title, township, address
        // 나머지는 기본값 보정해서 상관없음 (Acc Entity 참고)
        Acc acc = Acc.builder()
                .title("제주 선샤인 호텔")
                .tel("064-123-4567")
                .township(townshipId) // 임시값
                .address("제주특별자치도 제주시 애월읍 123-45")
                .build();

        accRepository.save(acc);
        log.info("NAVI_ACCOMMODATION 테이블 데이터 등록 완료: {}", acc.getAccId());
=======
    @Autowired
    private AccRepository accRepository;

    @Test
    public void accInsertTest() {
        Acc acc = Acc.builder()
                .title("제주 선샤인 호텔")
                .category("호텔")
                .tel("064-123-4567")
                .townshipId(1) // 임시 세팅
                .address("제주특별자치도 제주시 애월읍 123-45")
                .mapx(new BigDecimal("126.5432100"))
                .mapy(new BigDecimal("33.1234567"))
                .overview("해변과 가까운 프리미엄 호텔")
                .checkInTime("15:00")
                .checkOutTime("11:00")
                .hasCooking(false)
                .hasParking(true)
                .isActive(true)
                .build();

        accRepository.save(acc);
        log.info("NAVI_ACCOMMODATION 테이블 데이터 등록 완료: {}", acc);
>>>>>>> 6c0a28bfe961c1ef5334c9c2c794e402e31dfdcf
    }

    @Test
    public void accUpdateTest() {
<<<<<<< HEAD
        accRepository.findById(134L).ifPresent(acc -> {
            AccRequestDTO dto = AccRequestDTO.builder()
                    .title("업데이트 후 호텔")
                    .category("호텔")
                    .hasParking(true)
                    .build();
            acc.changeFromRequestDTO(dto);
            accRepository.save(acc);
            log.info("NAVI_ACCOMMODATION 테이블 데이터 수정 완료(accNo = {})", acc.getAccNo());
        });
=======
        Optional<Acc> accOptional = accRepository.findById(1L);
        if(accOptional.isPresent()) {
            Acc acc = accOptional.get();
            AccRequestDTO dto = AccRequestDTO.builder()
                    .title("업데이트 후 호텔")
                    .build();
            acc.changeFromRequestDTO(dto);
            accRepository.save(acc);
            log.info("NAVI_ACCOMMODATION 테이블 데이터 수정 완료");
        }
>>>>>>> 6c0a28bfe961c1ef5334c9c2c794e402e31dfdcf
    }

    @Test
    public void accDeleteTest() {
<<<<<<< HEAD
        accRepository.deleteById(134L);
        log.info("NAVI_ACCOMMODATION 테이블 데이터 삭제 완료(accNo = 1)");
=======
        accRepository.deleteById(1L);
        log.info("NAVI_ACCOMMODATION 테이블 데이터 삭제 완료");
>>>>>>> 6c0a28bfe961c1ef5334c9c2c794e402e31dfdcf
    }
}
