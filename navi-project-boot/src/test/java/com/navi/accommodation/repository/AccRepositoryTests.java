package com.navi.accommodation.repository;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.service.AccService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.Optional;

@SpringBootTest
@Slf4j
public class AccRepositoryTests {
    @Autowired
    private AccRepository accRepository;

    @Test
    public void accInsertTest() {
        Acc acc = Acc.builder()
                .accId("TESTID")
                .title("제주 선샤인 호텔")
                .category("호텔")
                .tel("064-123-4567")
                .townshipId(1) // 시스템/테스트에서 직접 값 세팅
                .address("제주특별자치도 제주시 애월읍 123-45")
                .mapx(new BigDecimal("126.5432100"))
                .mapy(new BigDecimal("33.1234567"))
                .overview("해변과 가까운 프리미엄 호텔")
                .checkIn("15:00")
                .checkOut("11:00")
                .hasCooking(false)
                .hasParking(true)
                .isActive(true)
                .build();

        accRepository.save(acc);
        log.info("NAVI_ACCOMMODATION 테이블 데이터 등록 완료: {}", acc);
    }

    @Test
    public void accDeleteTest() {
        accRepository.deleteById(1L);
        log.info("NAVI_ACCOMMODATION 테이블 데이터 삭제 완료");
    }

    @Test
    public void accUpdateTest() {
        Optional<Acc> accOptional = accRepository.findById(1L);
        if(accOptional.isPresent()) {
            Acc acc = accOptional.get();
//            acc.changeTitle("TEST 호텔");

            log.info("NAVI_ACCOMMODATION 테이블 데이터 수정");
            accRepository.save(acc);
        }
    }

    // 데이터 들어가는지 임시 확인
    @Autowired
    private AccService accService;

    @Test
    public void loadFromJsonFileTest() throws Exception {
        accService.loadFromJsonFile();
        log.info("✅ JSON 데이터 DB 적재 완료");
    }
}
