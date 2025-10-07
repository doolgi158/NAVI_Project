package com.navi.accommodation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccApiDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.repository.AccRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AccServiceImpl implements AccService{
    public final AccRepository accRepository;
    public final ObjectMapper objectMapper;

    /* === 관리자 전용 API 적재 === */
    @Value("classpath:accMockData/acc_list.json")   // 숙소 전체 리스트(최초 적재)
    private Resource listFile;
    @Value("classpath:accMockData/acc_basic.json")  // 특정 숙소 정보(보강 업데이트)
    private Resource basicFile;
    @Value("classpath:accMockData/acc_extra.json")  // 특정 숙소 추가 정보(보강 업데이트)
    private Resource extraFile;

    @Override
    // insert 전용 (insertOnly = true)
    public void loadFromJsonFile() throws IOException {
        processJson(listFile, true);
    }

    @Override
    // update 전용 (insertOnly = false)
    public void updateFromJsonFile() throws IOException {
        processJson(basicFile, false);
        processJson(extraFile, false);
    }

    // JSON 파일을 읽어서 DB에 적재하는 메서드
    public void processJson(Resource file, boolean insertOnly) throws IOException {
        // JSON 전체를 트리 형태의 구조로 파싱하여 JsonNode 타입으로 반환
        // JsonNode는 Map 처럼 계층 구조를 탐색할 수 있게 해줌
        JsonNode root = objectMapper.readTree(file.getInputStream());
        // JSON의 깊은 계층까지 순차 접근
        JsonNode items = root.path("response").path("body").path("items");
        // items는 배열(ArrayNode)이므로, for문으로 반복 탐색 가능
        for(JsonNode wrapper : items){
            JsonNode item = wrapper.path("item");
            // JSON의 item 내용을 AccApiDTO에 매핑(내부적으로 각 필드에 @JsonProperty 매핑 자동 적용)
            AccApiDTO dto = objectMapper.treeToValue(item, AccApiDTO.class);

            if(dto.getContentId().isBlank()) {
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

    @Override
    public void insertInitialFromApi(AccApiDTO dto) {
        Acc acc = Acc.builder().build();
        acc.changeFromApiDTO(dto, 1); // townshipId 임시값

        accRepository.save(acc);
        log.info("INSERT 성공 (contentId = {})", acc.getContentId());
    }

    @Override
    public void updateInitialFromApi(Acc acc, AccApiDTO dto) {
        acc.changeFromApiDTO(dto, 1); // townshipId 임시값

        accRepository.save(acc);
        log.info("UPDATE 성공 (contentId = {})", dto.getContentId());
    }

    /* === 관리자 전용 CRUD === */
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

    /* === 조회 (공통) === */
    @Override
    public List<Acc> getAllAcc() {
        return accRepository.findAll();
    }
}
