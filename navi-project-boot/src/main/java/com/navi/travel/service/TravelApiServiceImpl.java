//package com.navi.travel.service;
//
//import com.navi.travel.domain.Travel;
//import com.navi.travel.dto.TravelApiItemDTO;
//import com.navi.travel.dto.ListResponseDTO;
//import com.navi.travel.repository.TravelRepository;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.modelmapper.ModelMapper;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.domain.Sort;
//import org.springframework.http.ResponseEntity;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.web.client.RestTemplate;
//
//import javax.swing.text.html.Option;
//import java.math.BigDecimal;
//import java.util.Collections;
//import java.util.List;
//import java.util.Map;
//import java.util.Optional;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class TravelApiServiceImpl implements TravelApiService {
//
//    @Value("${api.travel.key}")
//    private String travelApiKey;
//    private final TravelRepository travelRepository;
//    private final ModelMapper modelMapper;  //DTO와 엔티티간의 매핑 담당 객체 선언
//    private final RestTemplate restTemplate;
//
//    // DTO → Entity
//    @Override
//    public Long register(TravelApiItemDTO travelApiItemDTO) {   //Travel 생성 기능 정의
//        Travel travel = modelMapper.map(travelApiItemDTO, Travel.class);   //Travel 항목 조회 기능 정의
//        Travel savedTravel = travelRepository.save(travel); //INSERT 쿼리 실행
//        return savedTravel.getTravelId();   //클라이언트에게 새로 생성된 항목의 id리턴
//    }
//
//    @Override
//    public TravelApiItemDTO get(Long travelId){
//        Optional<Travel> result = travelRepository.findById(travelId);
//        Travel travel = result.orElseThrow();
//        TravelApiItemDTO dto = modelMapper.map(travel, TravelApiItemDTO.class);
//
//        return dto;
//    }
//
//    //수정
//    @Override
//    public void modify(TravelApiItemDTO travelApiItemDTO) {
//
//        // ID로 기존 엔티티 조회 (존재하지 않으면 예외 발생)
//        Optional<Travel> result = travelRepository.findById(travelApiItemDTO.getTravelId());
//        Travel travel = result.orElseThrow(() ->
//                new RuntimeException("해당 ID(" + travelApiItemDTO.getTravelId() + ")의 여행지 정보를 찾을 수 없습니다.")
//        );
//
//        // DTO -> 임시 Travel 엔티티 변환 (ModelMapper 사용)
//        Travel newTravelData = modelMapper.map(travelApiItemDTO, Travel.class);
//
//
//        // 엔티티의 '일괄 수정' 메서드 호출
//        travel.updateFromApi(newTravelData);
//
//        //DB반영
//        travelRepository.save(travel);
//    }
//
//    //삭제
//    @Override
//    public void remove(Long travelId) {
//
//        // travelId로 해당 엔티티가 존재하는지 먼저 확인합니다.
//        Optional<Travel> result = travelRepository.findById(travelId);
//
//        // 만약 결과가 비어있다면(isEmtpy), 예외처리
//        result.orElseThrow(() ->
//                new IllegalArgumentException("삭제하려는 여행지 정보 (ID: " + travelId + ")를 찾을 수 없습니다.")
//        );
//
//        // 엔티티가 존재시 삭제를 진행합니다.
//        travelRepository.deleteById(travelId);
//    }
//
//    // API 호출 및 데이터 저장 로직 (페이지 번호를 이용한 페이징 처리)
//    @Override
//    @Transactional
//    public int saveApiData() {
//        String baseUrl = "https://api.visitjeju.net/vsjApi/contents/searchList";
//        int totalSavedCount = 0;
//        int currentPage = 1;
//        int totalCount = -1;// API에서 가져올 총 아이템 수
//
//        //최대 페이지 제한
//        final int MAX_PAGES = 1000;
//
//        while (true) {
//
//            // 안전 장치: 최대 페이지 수 초과 시 강제 종료
//            if (currentPage > MAX_PAGES) {
//                log.error("안전장치 발동: 설정된 최대 페이지 수 ({})를 초과하여 강제 종료합니다. 현재 누적 {}건.", MAX_PAGES, totalSavedCount);
//                break;
//            }
//
//            try {
//                String params = String.format("?apiKey=%s&locale=kr&page=%d", travelApiKey, currentPage);
//                String site = baseUrl + params;
//
//
//                log.info("API호출 시작: 페이지번호 (page={})", currentPage);
//
//                // 1. API 호출
//                ResponseEntity<Map> response = restTemplate.getForEntity(site, Map.class);
//                Map<String, Object> body = response.getBody();
//
//                if (body == null || body.isEmpty()) {
//                    log.warn("API 응답 본문이 비어있습니다. 페이징 종료.");
//                    break;
//                }
//
//                // API 응답에서 총 아이템 수 추출
//                if (totalCount == -1) {
//                    Object totalCountObj = body.get("totalCount");
//                    if (totalCountObj instanceof Number) {
//                        totalCount = ((Number) totalCountObj).intValue();
//                        log.info("총 API 아이템 수 확인: {}건", totalCount);
//                    }
//                }
//                // API 응답 구조에서 아이템 목록 추출
//                List<Map<String, Object>> items = (List<Map<String, Object>>) body.getOrDefault("items", Collections.emptyList());
//
//                // 2. 종료 조건 확인: 현재 페이지에 데이터가 없으면 루프 종료
//                if (items.isEmpty()) {
//                    log.info("페이지 {}에 더 이상 데이터가 없습니다. 총 {}건 저장 후 종료.", currentPage, totalSavedCount);
//                    break;
//                }
//
//                // 3. 현재 페이지 데이터 처리
//                int savedCountInPage = processItems(items);
//                totalSavedCount += savedCountInPage;
//
//                log.info("페이지 {} 처리 완료. {}건 저장. 현재까지 누적 {}건.", currentPage, savedCountInPage, totalSavedCount);
//
//                // 4. 총 아이템 수 기반 종료 조건 추가
//                if (totalCount != -1 && totalSavedCount >= totalCount) {
//                    log.info("총 아이템 수 ({})를 모두 처리했습니다. 총 {}건 저장 후 종료.", totalCount, totalSavedCount);
//                    break;
//                }
//
//                // 다음 페이지로 이동
//                currentPage++;
//            } catch (Exception e) {
//                log.error("API 호출 중 오류발생 (페이지 {}): {}", currentPage, e.getMessage(), e);
//                break;  //오류시 작업중단
//            }
//        }
//        return totalSavedCount;
//    }
//            /**
//             * 페이지 단위의 아이템 목록을 DB에 저장하거나 업데이트하는 로직을 수행합니다.
//             */
//            private int processItems(List<Map<String, Object>> items) {
//            int savedCount = 0;
//            for (Map<String, Object> item : items) {
//                // 2. Map을 Travel Entity로 매핑하는 별도의 메소드 호출
//                Optional<Travel> newTravelOpt = mapToTravelEntity(item);
//
//                if (newTravelOpt.isPresent()) {
//                    Travel newTravel = newTravelOpt.get();
//
//                    // 3. 중복 처리 (CONTENTS_ID 기준)
//                    Optional<Travel> existingTravelOpt = travelRepository.findByContentId(newTravel.getContentId());
//
//                    if (existingTravelOpt.isPresent()) {
//                        // 업데이트
//                        existingTravelOpt.get().updateFromApi(newTravel);
//                        travelRepository.save(existingTravelOpt.get());
//                    } else {
//                        // 삽입
//                        travelRepository.save(newTravel);
//                    }
//                    savedCount++;
//                }
//            }
//            return savedCount;
//    }
//
//    private Optional<Travel> mapToTravelEntity(Map<String, Object> item) {
//        // 1. 필수 값 검증
//        if (item.get("contentsid") == null || item.get("title") == null) {
//            // 필수 데이터가 누락되면 Optional.empty()를 반환하여 저장을 건너뜁니다.
//            System.err.println("필수 데이터(contentsid 또는 title) 누락: " + item);
//            return Optional.empty();
//        }
//
//        // 2. 데이터 추출 및 변환 (중첩 Map 처리 및 타입 변환)
//
//        // 중첩된 Map 데이터 추출
//        Map<String, String> contentsCd = (Map<String, String>) item.get("contentscd");
//        Map<String, String> region1Cd = (Map<String, String>) item.get("region1cd");
//        Map<String, String> region2Cd = (Map<String, String>) item.get("region2cd");
//
//        // 카테고리 이름 추출 (contentscd의 "label" 값)
//        String categoryName = contentsCd != null ? contentsCd.get("label") : null;
//
//
//        // RepPhoto -> photoid 구조 추출 (2단계 중첩)
//        Map<String, Object> repPhoto = (Map<String, Object>) item.get("repPhoto");
//        Map<String, Object> photoIdMap = (repPhoto != null) ? (Map<String, Object>) repPhoto.get("photoid") : null;
//
//        // '숙박' 데이터 제외 조건 확인
//        if ("숙박".equals(categoryName)) {
//            // 카테고리 이름이 '숙박'인 경우, 데이터 저장을 제외하기 위해 빈 Optional 반환
//            System.out.println("데이터 제외: 카테고리 이름이 '숙박'이므로 건너뜁니다 (ContentsId: " + item.get("contentsid") + ")");
//            return Optional.empty(); // 여기서 제외
//        }
//
//        // API 응답에서 좌표는 일반적으로 Double 형태로 오므로, BigDecimal로 변환합니다.
//        Double mapXDouble = (Double) item.get("longitude"); // 엔티티 MAPX (경도)
//        Double mapYDouble = (Double) item.get("latitude");  // 엔티티 MAPY (위도)
//
//        // PhotoId는 Number 형태로 올 수 있으므로 Long으로 변환합니다.
//        Number photoIdNumber = (Number) (photoIdMap != null ? photoIdMap.get("photoid") : null);
//
//
//
//        // 3. Travel 엔티티 생성 (Builder 사용)
//        Travel entity = Travel.builder()
//                .contentId((String) item.get("contentsid"))
//                .title((String) item.get("title"))
//                .introduction((String) item.get("introduction"))
//                .address((String) item.get("address"))
//                .roadAddress((String) item.get("roadaddress"))
//                .zipcode((String) item.get("postcode"))
//                .tel((String) item.get("phoneno"))
//                .tags((String) item.get("alltag"))
//
//                // 좌표 변환 및 Null 체크
//                .mapX(mapXDouble != null ? new BigDecimal(mapXDouble) : null)
//                .mapY(mapYDouble != null ? new BigDecimal(mapYDouble) : null)
//
//                // 카테고리 정보 (Null 체크)
//                .contentsCd(contentsCd != null ? contentsCd.get("value") : null)
//                .categoryName(categoryName)
//                .categoryRefId(contentsCd != null ? contentsCd.get("refId") : null)
//
//                // 지역 1차 정보 (Null 체크)
//                .region1Cd(region1Cd != null ? region1Cd.get("value") : null)
//                .region1Name(region1Cd != null ? region1Cd.get("label") : null)
//                .region1RefId(region1Cd != null ? region1Cd.get("refId") : null)
//
//                // 지역 2차 정보 (Null 체크)
//                .region2Cd(region2Cd != null ? region2Cd.get("value") : null)
//                .region2Name(region2Cd != null ? region2Cd.get("label") : null)
//                .region2RefId(region2Cd != null ? region2Cd.get("refId") : null)
//
//                // 사진 정보 (Null 체크 및 타입 변환)
//                .photoId(photoIdNumber != null ? photoIdNumber.longValue() : null)
//                .imagePath((String) (photoIdMap != null ? photoIdMap.get("imgpath") : null))
//                .thumbnailPath((String) (photoIdMap != null ? photoIdMap.get("thumbnailpath") : null))
//
//                // 관리 정보 (기본값 설정)
//                .state(1) // 기본값 1 (공개)
//                .build();
//
//        return Optional.of(entity);
//    }
//
//
//    // DB에서 페이징 처리된 목록을 조회하고 DTO로 변환하는 메서드 추가
//    @Override
//    @Transactional(readOnly = true) // 읽기 전용으로 설정
//    public ListResponseDTO<TravelApiItemDTO> getList(int page, int size) {
//
//        // 1. Pageable 객체 생성: 페이지 번호는 0부터 시작하므로 page - 1, 정렬 기준은 travelId 내림차순
//        Pageable pageable = PageRequest.of(
//                page - 1,
//                size,
//                Sort.by("travelId").descending() // 최신 등록순으로 정렬한다고 가정
//        );
//
//        // 2. Repository를 통해 DB에서 페이징된 데이터 조회
//        // Travel 엔티티의 조회수(views)와 좋아요 수(likes)는 이미 포함되어 있습니다.
//        Page<Travel> result = travelRepository.findAll(pageable);
//
//        // 3. 엔티티 리스트를 DTO 리스트로 변환
//        List<TravelApiItemDTO> dtoList = result.getContent().stream()
//                // ModelMapper를 사용하여 Travel 엔티티를 TravelApiItemDTO로 매핑
//                .map(travel -> modelMapper.map(travel, TravelApiItemDTO.class))
//                .toList();
//
//        // 4. 페이지네이션 정보 계산 및 ListResponseDTO 생성
//
//        // 현재 페이지 블록의 페이지네이션 버튼 수 (예: 10개)
//        int pageBlockSize = 10;
//
//        // 총 항목 수
//        int totalCount = (int) result.getTotalElements();
//        // 총 페이지 수
//        int totalPage = result.getTotalPages();
//
//        // 페이지네이션 블록 계산
//        int endPage = (int)(Math.ceil(page / (double)pageBlockSize)) * pageBlockSize;
//        int startPage = endPage - pageBlockSize + 1;
//
//        // 실제 총 페이지 수가 endPage보다 작으면 endPage를 조정
//        if(totalPage < endPage) {
//            endPage = totalPage;
//        }
//
//        // 페이지 번호 목록 생성
//        List<Integer> pageNumList = List.of();
//        if (startPage <= endPage) {
//            pageNumList = java.util.stream.IntStream.rangeClosed(startPage, endPage)
//                    .boxed().toList();
//        }
//
//        // ListResponseDTO 빌드 및 반환
//        return ListResponseDTO.<TravelApiItemDTO>builder()
//                .dtoList(dtoList)
//                .totalCount(totalCount)
//                .totalPage(totalPage)
//                .current(page)
//                .prev(result.hasPrevious()) // 이전 페이지 존재 여부
//                .next(result.hasNext())     // 다음 페이지 존재 여부
//                .startPage(startPage)
//                .endPage(endPage)
//                .pageNumList(pageNumList)
//                .build();
//    }
// }
