package com.navi.accommodation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccApiDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.repository.AccRepository;
import com.navi.common.config.kakao.GeoResult;
import com.navi.common.config.kakao.KakaoGeoService;
import com.navi.location.domain.Township;
import com.navi.location.repository.TownshipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.Random;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AccSyncService {
    private final AccRepository accRepository;
    private final ObjectMapper objectMapper;     // JSON <-> Java 객체 변환기
    private final TownshipRepository townshipRepository;
    private final KakaoGeoService kakaoGeoService;

    /* === JSON 파일 경로 === */
    // Resource : 파일 접근 추상화 인터페이스 (로컬, S3 등 어떤 경로든 동일한 방식으로 접근 가능)
    @Value("classpath:mockData/acc_list.json")
    private Resource listFile;
    @Value("classpath:mockData/acc_basic.json")
    private Resource basicFile;
    @Value("classpath:mockData/acc_extra.json")
    private Resource extraFile;
    @Value("classpath:mockData/acc_add.json")
    private Resource addFile;

    /* === 관리자 전용 API 적재 (by AccApiDTO) === */
    // 최초 적재(acc_list.json) : INSERT 전용 (insertOnly = true)
    public void loadApiFromJsonFile() throws IOException {
        processJson(listFile, AccApiDTO.class, true);
    }
    // 최초 적재(acc_basic.json & acc_extra.json) : UPDATE 전용 (insertOnly = false)
    public void updateApiFromJsonFile() throws IOException {
        processJson(basicFile, AccApiDTO.class, false);
        processJson(extraFile, AccApiDTO.class, false);
    }

    /* === 숙소 데이터 추가 적재 (by AccRequestDTO) === */
    // 최초 적재(acc_add.json) : INSERT 전용 (insertOnly = true)
    public void loadFromAdminJsonFile() throws IOException {
        processJson(addFile, AccRequestDTO.class, true);
    }

    /* JSON 파일 처리 - DB 적재 (공용 메서드) */
    public <T> void processJson(Resource file, Class<T> dtoClass, boolean insertOnly) throws IOException {
        // JSON 전체를 트리 형태의 구조로 파싱하여 JsonNode 타입으로 반환
        // JsonNode는 Map(key-value)처럼 계층 구조를 탐색할 수 있게 해줌
        JsonNode root = objectMapper.readTree(file.getInputStream());
        JsonNode items = root.path("response").path("body").path("items");

        // items는 배열(ArrayNode)이므로, for 문으로 반복 탐색 가능
        for(JsonNode wrapper : items){
            JsonNode item = wrapper.path("item");
            // JSON의 item 내용을 AccApiDTO에 매핑
            T dto = objectMapper.treeToValue(item, dtoClass);

            if (dto instanceof AccApiDTO apiDto) {
                handleApiDto(apiDto, insertOnly);       // AccApiDTO 처리
            } else if (dto instanceof AccRequestDTO reqDto) {
                handleRequestDto(reqDto);               // AccRequestDTO 처리
            }
        }
    }

    private void handleApiDto(AccApiDTO apiDto, boolean insertOnly) {
        if(apiDto.getContentId() == null || apiDto.getContentId().isBlank()) {
            log.warn("[API] contentId 없음 -> SKIP: {}", apiDto);
            return;
        }

        Long contentId = Long.parseLong(apiDto.getContentId());
        if(insertOnly) {
            accRepository.findByContentId(contentId)
                    .ifPresentOrElse(
                            acc -> log.warn("[API] 이미 존재 -> SKIP: {}", contentId),
                            () -> insertInitialFromApi(apiDto)
                    );
        } else {
            accRepository.findByContentId(contentId)
                    .ifPresentOrElse(
                            acc -> updateInitialFromApi(acc, apiDto),
                            () -> log.warn("[API] 업데이트 대상 없음 - contentId: {}", contentId)
                    );
        }
    }

    /* === 관리자 전용 API 삽입/수정 (by AccApiDTO) === */
    // 신규 데이터 삽입 (acc_list.json)
    public void insertInitialFromApi(AccApiDTO dto) {
        Long nextSeq = accRepository.getNextSeqVal();
        String accId = String.format("ACC%03d", nextSeq);

        Township township = townshipRepository.findById(1L)
                .orElseThrow(() -> new IllegalArgumentException("해당 지역을 찾을 수 없습니다."));

        Acc acc = Acc.builder()
                .accNo(nextSeq)
                .accId(accId)
                .build();
        acc.changeFromApiDTO(dto, township);
        accRepository.save(acc);

        log.info("[API] INSERT 성공 (contentId = {}, accId = {})", acc.getContentId(), accId);

    }
    // 기존 데이터 갱신 (acc_basic.json & acc_extra.json)
    public void updateInitialFromApi(Acc acc, AccApiDTO dto) {
        Township townshipId = acc.getTownship();
        acc.changeFromApiDTO(dto, townshipId);

        accRepository.save(acc);
        log.info("[API] UPDATE 성공 (contentId = {})", dto.getContentId());
    }

    /* === 숙소 데이터 추가 삽입 (by AccRequestDTO) === */
    // 신규 데이터 삽입 (acc_add.json)
    private void handleRequestDto(AccRequestDTO reqDto) {
        // Todo: 중복 비교 로직 고도화 필요 (나중에)
        Long nextSeq = accRepository.getNextSeqVal();
        String accId = String.format("ACC%03d", nextSeq);

        Township townshipId = townshipRepository.findById(1L)   // townshipId 임시값
                .orElseThrow(() -> new IllegalArgumentException("해당 지역을 찾을 수 없습니다."));

        Acc acc = Acc.builder()
                .accNo(nextSeq)
                .accId(accId)
                .build();

        acc.changeTownship(townshipId);
        acc.changeFromRequestDTO(reqDto);

        accRepository.save(acc);
        log.info("[ADMIN] JSON 기반 숙소 추가 성공 → {} ({})", acc.getTitle(), accId);
    }

    /* === 전체 데이터 수정 (후처리) === */
    public void updateAll() {
        List<Acc> accList = accRepository.findAll();
        Random random = new Random();

        for(Acc acc : accList) {
            try {
                // 읍면동 매핑 + 좌표 + 카테고리 갱신
                GeoResult geo = kakaoGeoService.getCoordinatesAndTownship(acc.getAddress(), acc.getTitle());
                if (geo == null) {
                    log.warn("[SYNC] {} → KakaoGeo 결과 없음", acc.getTitle());
                    continue;
                }
                Township township = matchTownshipByGeoResult(geo.getTownshipName());

                acc.changeTownship(township);
                acc.changeLocation(geo.getMapx(), geo.getMapy());
                acc.changeCategory(geo.getCategory());

                // 랜덤 필드 설정
                AccRequestDTO dto = AccRequestDTO.builder()
                        .hasParking(random.nextBoolean())
                        .hasCooking(random.nextBoolean())
                        .build();
                acc.changeFromRequestDTO(dto);

                accRepository.save(acc);
            } catch (Exception e) {
                log.error("[SYNC] {} 처리 실패: {}", acc.getTitle(), e.getMessage());
            }
        }
    }

    public Township matchTownshipByGeoResult(String townshipName) {
        if (townshipName == null || townshipName.isBlank()) {
            return null;
        }
        // 읍/면/시내까지만 자르기 (예: "표선면 표선리" → "표선면")
        String[] parts = townshipName.split(" ");
        String trimmed = parts[0]; // 첫 번째 토큰만 사용

        // township_name 컬럼 기준 LIKE 검색
        return townshipRepository.findByTownshipName(trimmed)
                .orElseGet(() -> {
                    log.warn("[SYNC] 읍면 매핑 실패 → {}", townshipName);
                    return null;
                });
    }
}
