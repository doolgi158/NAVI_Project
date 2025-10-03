package com.navi.travel.service;

import com.navi.travel.domain.Travel;
import com.navi.travel.dto.TravelApiItemDTO;
import com.navi.travel.repository.TravelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TravelApiServiceImpl implements TravelApiService {

    @Value("${api.travel.key}")
    private String travelApiKey;    
    private final TravelRepository travelRepository;
    private final ModelMapper modelMapper;  //DTO와 엔티티간의 매핑 담당 객체 선언
    private final RestTemplate restTemplate;

    // API 호출 및 데이터 저장 로직 (페이지 번호를 이용한 페이징 처리)
    @Override
    @Transactional
    public int saveApiData() {
        String baseUrl = "https://api.visitjeju.net/vsjApi/contents/searchList";
        int totalSavedCount = 0;
        int currentPage = 1;
        int totalCount = -1;// API에서 가져올 총 아이템 수

        //최대 페이지 제한
        final int MAX_PAGES = 1000;

        while (true) {

            // 안전 장치: 최대 페이지 수 초과 시 강제 종료
            if (currentPage > MAX_PAGES) {
                log.error("안전장치 발동: 설정된 최대 페이지 수 ({})를 초과하여 강제 종료합니다. 현재 누적 {}건.", MAX_PAGES, totalSavedCount);
                break;
            }

            try {
                String params = String.format("?apiKey=%s&locale=kr&page=%d", travelApiKey, currentPage);
                String site = baseUrl + params;


                log.info("API호출 시작: 페이지번호 (page={})", currentPage);

                // 1. API 호출
                ResponseEntity<Map> response = restTemplate.getForEntity(site, Map.class);
                Map<String, Object> body = response.getBody();

                if (body == null || body.isEmpty()) {
                    log.warn("API 응답 본문이 비어있습니다. 페이징 종료.");
                    break;
                }

                // API 응답에서 총 아이템 수 추출
                if (totalCount == -1) {
                    Object totalCountObj = body.get("totalCount");
                    if (totalCountObj instanceof Number) {
                        totalCount = ((Number) totalCountObj).intValue();
                        log.info("총 API 아이템 수 확인: {}건", totalCount);
                    }
                }
                // API 응답 구조에서 아이템 목록 추출
                List<Map<String, Object>> items = (List<Map<String, Object>>) body.getOrDefault("items", Collections.emptyList());

                // 2. 종료 조건 확인: 현재 페이지에 데이터가 없으면 루프 종료
                if (items.isEmpty()) {
                    log.info("페이지 {}에 더 이상 데이터가 없습니다. 총 {}건 저장 후 종료.", currentPage, totalSavedCount);
                    break;
                }

                // 3. 현재 페이지 데이터 처리
                int savedCountInPage = processItems(items);
                totalSavedCount += savedCountInPage;

                log.info("페이지 {} 처리 완료. {}건 저장. 현재까지 누적 {}건.", currentPage, savedCountInPage, totalSavedCount);

                // 4. 총 아이템 수 기반 종료 조건 추가
                if (totalCount != -1 && totalSavedCount >= totalCount) {
                    log.info("총 아이템 수 ({})를 모두 처리했습니다. 총 {}건 저장 후 종료.", totalCount, totalSavedCount);
                    break;
                }

                // 다음 페이지로 이동
                currentPage++;
            } catch (Exception e) {
                log.error("API 호출 중 오류발생 (페이지 {}): {}", currentPage, e.getMessage(), e);
                break;  //오류시 작업중단
            }
        }
        return totalSavedCount;
    }
            /**
             * 페이지 단위의 아이템 목록을 DB에 저장하거나 업데이트하는 로직을 수행합니다.
             */
            private int processItems(List<Map<String, Object>> items) {
            int savedCount = 0;
            for (Map<String, Object> item : items) {
                // 2. Map을 Travel Entity로 매핑하는 별도의 메소드 호출
                Optional<Travel> newTravelOpt = mapToTravelEntity(item);

                if (newTravelOpt.isPresent()) {
                    Travel newTravel = newTravelOpt.get();

                    // 3. 중복 처리 (CONTENTS_ID 기준)
                    Optional<Travel> existingTravelOpt = travelRepository.findByContentId(newTravel.getContentId());

                    if (existingTravelOpt.isPresent()) {
                        // 업데이트
                        existingTravelOpt.get().updateFromApi(newTravel);
                        travelRepository.save(existingTravelOpt.get());
                    } else {
                        // 삽입
                        travelRepository.save(newTravel);
                    }
                    savedCount++;
                }
            }
            return savedCount;
    }

    private Optional<Travel> mapToTravelEntity(Map<String, Object> item) {
        // 1. 필수 값 검증
        if (item.get("contentsid") == null || item.get("title") == null) {
            // 필수 데이터가 누락되면 Optional.empty()를 반환하여 저장을 건너뜁니다.
            System.err.println("필수 데이터(contentsid 또는 title) 누락: " + item);
            return Optional.empty();
        }

        // 2. 데이터 추출 및 변환 (중첩 Map 처리 및 타입 변환)

        // 중첩된 Map 데이터 추출
        Map<String, String> contentsCd = (Map<String, String>) item.get("contentscd");
        Map<String, String> region1Cd = (Map<String, String>) item.get("region1cd");
        Map<String, String> region2Cd = (Map<String, String>) item.get("region2cd");

        // RepPhoto -> photoid 구조 추출 (2단계 중첩)
        Map<String, Object> repPhoto = (Map<String, Object>) item.get("repPhoto");
        Map<String, Object> photoIdMap = (repPhoto != null) ? (Map<String, Object>) repPhoto.get("photoid") : null;

        // API 응답에서 좌표는 일반적으로 Double 형태로 오므로, BigDecimal로 변환합니다.
        Double mapXDouble = (Double) item.get("longitude"); // 엔티티 MAPX (경도)
        Double mapYDouble = (Double) item.get("latitude");  // 엔티티 MAPY (위도)

        // PhotoId는 Number 형태로 올 수 있으므로 Long으로 변환합니다.
        Number photoIdNumber = (Number) (photoIdMap != null ? photoIdMap.get("photoid") : null);

        // 3. Travel 엔티티 생성 (Builder 사용)
        Travel entity = Travel.builder()
                .contentId((String) item.get("contentsid"))
                .title((String) item.get("title"))
                .introduction((String) item.get("introduction"))
                .address((String) item.get("address"))
                .roadAddress((String) item.get("roadaddress"))
                .zipcode((String) item.get("postcode"))
                .tel((String) item.get("phoneno"))
                .tags((String) item.get("alltag"))

                // 좌표 변환 및 Null 체크
                .mapX(mapXDouble != null ? new BigDecimal(mapXDouble) : null)
                .mapY(mapYDouble != null ? new BigDecimal(mapYDouble) : null)

                // 카테고리 정보 (Null 체크)
                .contentsCd(contentsCd != null ? contentsCd.get("value") : null)
                .categoryName(contentsCd != null ? contentsCd.get("label") : null)
                .categoryRefId(contentsCd != null ? contentsCd.get("refId") : null)

                // 지역 1차 정보 (Null 체크)
                .region1Cd(region1Cd != null ? region1Cd.get("value") : null)
                .region1Name(region1Cd != null ? region1Cd.get("label") : null)
                .region1RefId(region1Cd != null ? region1Cd.get("refId") : null)

                // 지역 2차 정보 (Null 체크)
                .region2Cd(region2Cd != null ? region2Cd.get("value") : null)
                .region2Name(region2Cd != null ? region2Cd.get("label") : null)
                .region2RefId(region2Cd != null ? region2Cd.get("refId") : null)

                // 사진 정보 (Null 체크 및 타입 변환)
                .photoId(photoIdNumber != null ? photoIdNumber.longValue() : null)
                .imagePath((String) (photoIdMap != null ? photoIdMap.get("imgpath") : null))
                .thumbnailPath((String) (photoIdMap != null ? photoIdMap.get("thumbnailpath") : null))

                // 관리 정보 (기본값 설정)
                .state(1) // 기본값 1 (공개)
                .build();

        return Optional.of(entity);
    }

    @Override
    public Long register(TravelApiItemDTO travelApiItemDTO) {   //Travel 생성 기능 정의
        Travel travel = modelMapper.map(travelApiItemDTO, Travel.class);   //Travel 항목 조회 기능 정의
        Travel savedTravel = travelRepository.save(travel); //INSERT 쿼리 실행
        return savedTravel.getTravelId();   //클라이언트에게 새로 생성된 항목의 id리턴
    }

 }
