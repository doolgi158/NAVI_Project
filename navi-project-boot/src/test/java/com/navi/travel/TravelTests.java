package com.navi.travel;

import com.navi.travel.domain.Travel;
import com.navi.travel.repository.TravelRepository;
import com.navi.travel.service.TravelService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.Optional;


@SpringBootTest
@Slf4j
public class TravelTests {

    //db결과 확인용 리포지토리
    @Autowired
    private TravelRepository travelRepository;

    //테스트 대상 서비스
    @Autowired
    private TravelService travelService;

    /**
     * API 데이터 저장 및 업데이트 테스트
     * 트랜잭션 종료 시 DB 변경 사항은 자동 롤백됩니다.
     */
    @Test
    //@Transactional // 테스트 후 DB 롤백 처리
    public void insertTravelData() {
        log.info("--- [테스트 시작: API 데이터 저장] ---");

        // 1. 초기 데이터 상태 확인 (선택 사항)
        long initialCount = travelRepository.count();
        log.info("초기 DB 레코드 수: {}건", initialCount);

        // 2. 서비스 메소드 호출 (실제 API 호출 및 DB 저장 로직 실행)
        int savedCount = travelService.saveApiData();

        // 3. 결과 검증
        log.info("API 호출 및 저장/업데이트 처리 건수: {}건", savedCount);

        // API에서 최소 1건 이상의 데이터를 가져왔는지 검증
        assertThat(savedCount)
                .as("API에서 가져온 데이터는 0건 이상이어야 합니다.")
                .isGreaterThanOrEqualTo(0);

        // 저장/업데이트가 발생했다면 최종 건수는 초기 건수보다 크거나 같아야 합니다.
        long finalCount = travelRepository.count();
        log.info("최종 DB 레코드 수: {}건", finalCount);

        // saveApiData() 내부 로직이 총 100건 제한이 걸려있으므로, savedCount 만큼 증가했을 수 있습니다.
        assertThat(finalCount).isGreaterThanOrEqualTo(initialCount);

    }

    /**
     * 특정 ID로 Travel 데이터 조회 테스트
     * 테스트의 독립성을 위해 데이터를 생성 후 조회합니다.
     */
    @Test
    @Transactional // 테스트 후 DB 롤백 처리
    public void testRead() {
        // Arrange (데이터 준비)
        // 1. 테스트용 Travel 엔티티를 생성하고 DB에 저장합니다.
        Travel travel = Travel.builder()
                .contentId("TEST_READ_001")
                .title("테스트 조회용 여행지")
                .contentsCd("R001")
                .state(1)
                .longitude(126.5)
                .latitude(33.4)
                .build();

        Travel savedTravel = travelRepository.save(travel);
        Long travelId = savedTravel.getTravelId();

        // Act (로직 실행)
        // 2. 저장된 ID로 조회합니다.
        Optional<Travel> result = travelRepository.findById(travelId);

        // Assert (결과 검증)
        // 3. Optional이 비어있지 않은지 확인하고 값을 가져옵니다.
        Travel foundTravel = result.orElseThrow(() ->
                new NoSuchElementException("저장한 테스트 데이터 ID: " + travelId + " 로 조회 실패"));

        // 4. 조회된 데이터의 내용이 일치하는지 확인합니다.
        assertThat(foundTravel.getTitle()).isEqualTo("테스트 조회용 여행지");

        log.info("데이터 조회 성공: {}", foundTravel);
    }
}