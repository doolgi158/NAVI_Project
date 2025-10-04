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
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AccServiceImpl implements AccService{
    public final AccRepository accRepository;
    public final ObjectMapper objectMapper;

    /* === 관리자 전용 API 적재 === */
    //JSON 파일 경로 지정
    @Value("classpath:accMockData/acc_list.json")   // 숙소 전체 리스트(최초 적재)
    private Resource listFile;
    @Value("classpath:accMockData/acc_basic.json")  // 특정 숙소 정보(보강 업데이트)
    private Resource basicFile;
    @Value("classpath:accMockData/acc_extra.json")  // 특정 숙소 추가 정보(보강 업데이트)
    private Resource extraFile;

    @Override
    /* insert 전용 */
    public void loadFromJsonFile() throws IOException {
        processJson(listFile, true);
    }

    @Override
    /* update 전용 */
    public void updateFromJsonFile() throws IOException {
        processJson(basicFile, false);
        processJson(extraFile, false);
    }

    // insertOnly가 true면 insert 전용, false면 update 전용
    public void processJson(Resource file, boolean insertOnly) throws IOException {
        // JSON 파싱하여 트리 구조로 유연하게 탐색
        JsonNode root = objectMapper.readTree(file.getInputStream());
        JsonNode items = root.path("response").path("body").path("items");

        for(JsonNode wrapper : items){
            JsonNode item = wrapper.path("item");
            // JSON의 item 내용을 AccApiDTO에 매핑
            AccApiDTO dto = objectMapper.treeToValue(item, AccApiDTO.class);

            if(dto.getContentId().isBlank()) {
                log.warn("contentId 없음 -> SKIP: {}", dto);
                continue;
            }

            Long contentId = Long.parseLong(dto.getContentId());

            if(insertOnly) {
                accRepository.findByContentId(contentId)
                        .ifPresentOrElse(
                                acc -> log.info("이미 존제 -> SKIP: {}", contentId),
                                () -> insertInitialFromApi(dto)
                        );
            } else {
                accRepository.findByContentId(contentId)
                        .ifPresent(acc -> {
                            acc.changeFromApiDTO(dto, 1); // townshipId 임시값
                            accRepository.save(acc);
                            log.info("UPDATE 성공 (contentId = {})", contentId);
                        });
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
