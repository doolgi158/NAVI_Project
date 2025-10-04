package com.navi.accommodation.repository;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.service.AccService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Slf4j
public class AccRepositoryTests {
    @Autowired
    private AccRepository accRepository;

    @Test
    public void accInsertTest() {
        // 필수적으로 명시해줘야 하는 항목 : title, township, address
        // 나머지는 기본값 보정해서 상관없음 (Acc Entity 참고)
        Acc acc = Acc.builder()
                .title("제주 선샤인 호텔")
                .tel("064-123-4567")
                .townshipId(1) // 임시값
                .address("제주특별자치도 제주시 애월읍 123-45")
                .build();

        accRepository.save(acc);
        log.info("NAVI_ACCOMMODATION 테이블 데이터 등록 완료: {}", acc);
    }

    @Test
    public void accUpdateTest() {
        accRepository.findById(1L).ifPresent(acc -> {
            AccRequestDTO dto = AccRequestDTO.builder()
                    .title("업데이트 후 호텔")
                    .category("호텔")
                    .hasParking(true)
                    .build();
            acc.changeFromRequestDTO(dto);
            accRepository.save(acc);
            log.info("NAVI_ACCOMMODATION 테이블 데이터 수정 완료");
        });
    }

    @Test
    public void accDeleteTest() {
        accRepository.deleteById(2L);
        log.info("NAVI_ACCOMMODATION 테이블 데이터 삭제 완료");
    }

    @Autowired
    private AccService accService;

    @Test
    public void loadAccData() throws Exception {
        accService.loadFromJsonFile();
        log.info("API 데이터 DB 초기 적재 완료");
    }
    @Test
    public void updateAccData() throws Exception {
        accService.updateFromJsonFile();
        log.info("API 데이터 DB 초기 업데이트 완료");
    }
}
