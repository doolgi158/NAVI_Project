package com.navi.accommodation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccApiDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.dto.request.AccSearchRequestDTO;
import com.navi.accommodation.dto.response.AccDetailResponseDTO;
import com.navi.accommodation.dto.response.AccListResponseDTO;
import com.navi.accommodation.repository.AccRepository;
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

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AccServiceImpl implements AccService{
    private final AccRepository accRepository;
    private final TownshipRepository townshipRepository;
    private final ObjectMapper objectMapper;    // JSON <-> Java 객체 변환기

    /** === JSON 파일 경로 === */
    // Resource : 파일 접근 추상화 인터페이스 (로컬, S3 등 어떤 경로든 동일한 방식으로 접근 가능)
    @Value("classpath:accMockData/acc_list.json")   // 숙소 전체 리스트(최초 적재)
    private Resource listFile;
    @Value("classpath:accMockData/acc_basic.json")  // 특정 숙소 정보(보강 업데이트)
    private Resource basicFile;
    @Value("classpath:accMockData/acc_extra.json")  // 특정 숙소 추가 정보(보강 업데이트)
    private Resource extraFile;

    /** === 관리자 전용 API 적재 === */
    @Override
    // INSERT 전용 (insertOnly = true)
    public void loadFromJsonFile() throws IOException {
        log.info("[API] 숙소 리스트 파일 적재 시작");
        processJson(listFile, true);
        log.info("[API] 숙소 리스트 파일 적재 완료");
    }

    @Override
    // UPDATE 전용 (insertOnly = false)
    public void updateFromJsonFile() throws IOException {
        log.info("[API] 숙소 상세 파일 갱신 시작");
        processJson(basicFile, false);
        processJson(extraFile, false);
        log.info("[API] 숙소 상세 파일 갱신 완료");
    }

    /** JSON 파일 처리 - DB 적재 (공용 메서드) */
    public void processJson(Resource file, boolean insertOnly) throws IOException {
        // JSON 전체를 트리 형태의 구조로 파싱하여 JsonNode 타입으로 반환
        // JsonNode는 Map(key-value)처럼 계층 구조를 탐색할 수 있게 해줌
        JsonNode root = objectMapper.readTree(file.getInputStream());
        // JSON의 깊은 계층까지 순차 접근
        JsonNode items = root.path("response").path("body").path("items");
        // items는 배열(ArrayNode)이므로, for 문으로 반복 탐색 가능
        for(JsonNode wrapper : items){
            JsonNode item = wrapper.path("item");
            // JSON의 item 내용을 AccApiDTO에 매핑
            AccApiDTO dto = objectMapper.treeToValue(item, AccApiDTO.class);

            if(dto.getContentId() == null || dto.getContentId().isBlank()) {
                log.warn("contentId 없음 -> SKIP: {}", dto);
                continue;
            }

            Long contentId = Long.parseLong(dto.getContentId());

            if(insertOnly) {
                accRepository.findByContentId(contentId)
                        .ifPresentOrElse(
                                acc -> log.info("이미 존재 -> SKIP: {}", contentId),
                                () -> insertInitialFromApi(dto)
                        );
            } else {
                accRepository.findByContentId(contentId)
                        .ifPresentOrElse(
                                acc -> updateInitialFromApi(acc, dto),
                                () -> log.warn("업데이트 대상 없음 (contentId = {})", contentId)
                        );
            }
        }
    }

    /** 신규 데이터 삽입 (acc_list.json 전용) */
    @Override
    public void insertInitialFromApi(AccApiDTO dto) {
        Acc acc = Acc.builder().build();
        // Todo: 주소 매핑 로직 완성 후 변경 예정
        //Township township = TownshipRepository.findTownshipByAddress(...);
        Township townshipId = townshipRepository.findById(1L)   // Todo: townshipId 임시값
                        .orElseThrow(() -> new IllegalArgumentException("해당 지역을 찾을 수 없습니다."));
        acc.changeFromApiDTO(dto, townshipId);

        accRepository.save(acc);
        log.info("INSERT 성공 (contentId = {})", acc.getContentId());
    }

    @Override
    public void updateInitialFromApi(Acc acc, AccApiDTO dto) {
        Township townshipId = acc.getTownship();
        acc.changeFromApiDTO(dto, townshipId);

        accRepository.save(acc);
        log.info("UPDATE 성공 (contentId = {})", dto.getContentId());
    }

    /** === 관리자 전용 CRUD === */
    @Override
    public Acc createAcc(AccRequestDTO dto) {
        Acc acc = Acc.builder().build();
        acc.changeFromRequestDTO(dto);
        return accRepository.save(acc);
    }

    @Override
    public Acc updateAcc(Long accNo, AccRequestDTO dto) {
        Acc acc = accRepository.findById(accNo)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));

        // API 숙소 수정 불가
        if(acc.getContentId() != null) {
            throw new IllegalStateException("API로 받아온 숙소는 수정할 수 없습니다.");
        }
        acc.changeFromRequestDTO(dto);
        return accRepository.save(acc);
    }

    @Override
    public void deleteAcc(Long accNo) {
        Acc acc = accRepository.findById(accNo)
                .orElseThrow(() -> new IllegalArgumentException("숙소가 존재하지 않습니다."));

        // API 숙소 삭제 불가
        if(acc.getContentId() != null) {
            throw new IllegalStateException("API로 받아온 숙소는 삭제할 수 없습니다.");
        }
        // 예약사항이 있으면 삭제 불가
        if(!acc.isDeletable()) {
            throw new IllegalStateException("삭제 불가 상태의 숙소입니다.");
        }

        accRepository.delete(acc);
    }

    /** === 조회 (공통) === */
    @Override
    @Transactional(readOnly = true)
    public List<Acc> getAllAcc() {
        return accRepository.findAll();
    }

    /** === 사용자 전용 조회 === */
    @Override
    @Transactional(readOnly = true)
    public List<AccListResponseDTO> searchAccommodations(AccSearchRequestDTO dto) {
        // TODO: 지역명 기반 필터링 + 날짜/인원 조건 추가 예정
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public AccDetailResponseDTO getAccDetail(String accId) {
        // TODO: 숙소 + 객실 + 이미지 조합 응답
        return null;
    }
}
