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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
@Slf4j
public class AccRepositoryTests {
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
        log.info("✅ KakaoGeo 기반 좌표, 카테고리 및 읍면동 전체 동기화 완료");
    }

    /* === 대표 이미지 컬럼 갱신 === */
    @Test
    public void updateAllMainImages() {
        log.info("🧩 [TEST] 숙소 대표 이미지 일괄 갱신 시작");

        List<Acc> accList = accRepository.findAll();
        log.info("총 숙소 개수: {}", accList.size());

        int updatedCount = 0;

        for (Acc acc : accList) {
            try {
                accService.updateMainImage(acc.getAccId());
                updatedCount++;
            } catch (Exception e) {
                log.warn("⚠️ 대표 이미지 갱신 실패 - accId={}, 이유={}", acc.getAccId(), e.getMessage());
            }
        }

        log.info("✅ 대표 이미지 갱신 완료: {}/{}건 성공", updatedCount, accList.size());
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
    }

    @Test
    public void accUpdateTest() {
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
    }

    @Test
    public void accDeleteTest() {
        accRepository.deleteById(134L);
        log.info("NAVI_ACCOMMODATION 테이블 데이터 삭제 완료(accNo = 1)");
    }
}