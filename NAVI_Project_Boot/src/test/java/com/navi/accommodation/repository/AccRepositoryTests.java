package com.navi.accommodation.repository;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.request.AccRequestDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

@SpringBootTest
@Slf4j
public class AccRepositoryTests {
    @Autowired
    private AccRepository accRepository;

    @Test
    public void accInsertTest() {
        // DTO 생성
        AccRequestDTO dto = AccRequestDTO.builder()
                .title("제주 선샤인 호텔")
                .category("호텔")
                .tel("064-123-4567")
                .address("제주특별자치도 제주시 애월읍 123-45")
                .overview("해변과 가까운 프리미엄 호텔")
                .checkIn("15:00")
                .checkOut("11:00")
                .hasCooking(false)
                .hasParking(true)
                .isActive(true)
                .build();

        // DTO -> Entity 변환
        Acc acc = Acc.builder()
                .accId("TESTID")
                .title(dto.getTitle())
                .category(dto.getCategory())
                .tel(dto.getTel())
                .townshipId(1) // 시스템/테스트에서 직접 값 세팅
                .address(dto.getAddress())
                .mapx(new BigDecimal("126.5432100"))
                .mapy(new BigDecimal("33.1234567"))
                .overview(dto.getOverview())
                .checkIn(dto.getCheckIn())
                .checkOut(dto.getCheckOut())
                .hasCooking(dto.getHasCooking())
                .hasParking(dto.getHasParking())
                .isDeletable(false)
                .isActive(dto.getIsActive())
                .build();

        accRepository.save(acc);
        log.info("숙소 등록 완료: {}", acc);
    }
}
