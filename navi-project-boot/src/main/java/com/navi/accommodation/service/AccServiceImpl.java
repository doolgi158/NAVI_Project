package com.navi.accommodation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccApiDTO;
import com.navi.accommodation.repository.AccRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class AccServiceImpl implements AccService{
    public final AccRepository accRepository;
    public final ObjectMapper objectMapper;

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

            if(dto.getContentId() == null) {
                log.warn("contentId 없음 -> SKIP: {}", dto);
                continue;
            }

            if(insertOnly) {
                accRepository.findByContentId(dto.getContentId())
                        .ifPresentOrElse(
                                acc -> log.info("이미 존제 -> SKIP: {}", dto.getContentId()),
                                () -> insertInitialFromApi(dto)
                        );
            } else {
                accRepository.findByContentId(dto.getContentId())
                        .ifPresent(acc -> {
                            acc.changeDetails(
                                    dto.getOverview(),
                                    dto.getCheckIn(),
                                    dto.getCheckOut(),
                                    dto.getHasCooking(),
                                    dto.getHasParking()
                            );
                            accRepository.save(acc);
                            log.info("UPDATE 성공 (contentId = {})", acc.getContentId());
                        });
            }
        }
    }

    @Override
    public void insertInitialFromApi(AccApiDTO dto) {
        Acc acc = Acc.builder()
                .contentId(dto.getContentId())
                .title(dto.getTitle())
                .category(dto.getCategory())
                .tel(dto.getTel())
                .townshipId(1)  // 임시값
                .address(dto.getAddr1() + (dto.getAddr2() != null ? dto.getAddr2() : ""))
                .mapy(dto.getMapy())
                .mapx(dto.getMapx())
                .createdTime(LocalDateTime.now())
                .modifiedTime(LocalDateTime.now())
                .build();

        accRepository.save(acc);
        log.info("INSERT 성공 (contentId = {})", acc.getContentId());
    }
}
