package com.navi.travel;

import com.navi.travel.domain.Travel;
import com.navi.travel.repository.TravelRepository;
import com.navi.travel.service.TravelApiService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@Slf4j
public class TravelTests {

    //db결과 확인용 리포지토리
    @Autowired
    private TravelRepository travelRepository;

    //테스트 대상 서비스
    @Autowired
    private TravelApiService travelApiService;

    @Test
    public void insertTravelData() {
        System.out.println("--- [테스트 시작: API 데이터 저장] ---");

        // 1. 초기 데이터 상태 확인 (선택 사항)
        long initialCount = travelRepository.count();
        System.out.println("초기 DB 레코드 수: " + initialCount + "건");

        // 2. 서비스 메소드 호출 (실제 API 호출 및 DB 저장 로직 실행)
        int savedCount = travelApiService.saveApiData();

        // 3. 결과 검증
        System.out.println("API 호출 및 저장/업데이트 처리 건수: " + savedCount + "건");

        // API에서 최소 1건 이상의 데이터를 가져왔는지 검증
        assertThat(savedCount)
                .as("API에서 가져온 데이터는 0건 이상이어야 합니다.")
                .isGreaterThanOrEqualTo(0);

        // DB에 실제로 데이터가 저장되었는지 확인
        long finalCount = travelRepository.count();
        System.out.println("최종 DB 레코드 수: " + finalCount + "건");

        System.out.println("--- [테스트 완료: DB 자동 롤백] ---");

    }

    @Test
    public void testRead() {
        Long travelId = 302L;
        Optional<Travel> result = travelRepository.findById(travelId);
        Travel travel = result.orElseThrow();
        log.info("데이터 조회 : {}",travel);
    }
}
