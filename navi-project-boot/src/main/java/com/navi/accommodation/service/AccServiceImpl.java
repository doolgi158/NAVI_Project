package com.navi.accommodation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccApiDTO;
import com.navi.accommodation.repository.AccRepository;
import com.navi.common.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AccServiceImpl implements AccService{
    public final AccRepository accRepository;
    public final ObjectMapper objectMapper;
    public final IdGenerator idGenerator;

    //JSON 파일 경로 지정
    @Value("classpath:accMockData/acc_list.json")
    private Resource jsonFile;

    @Override
    public void loadFromJsonFile() throws IOException {
        JsonNode root = objectMapper.readTree(jsonFile.getInputStream());
        JsonNode items = root.path("response").path("body").path("items");

        //int count = 0;

        for(JsonNode wrapper : items) {
            //if(count >= 10) break;
            JsonNode item = wrapper.path("item");

            // JSON -> DTO 변환
            AccApiDTO dto = objectMapper.treeToValue(item, AccApiDTO.class);
            // DTO -> Entity 저장
            insertFromApi(dto);

            //count++;
        }
    }


    @Override
    public void insertFromApi(AccApiDTO dto) {
        // accId 생성
//        String maxAccId = accRepository.findMaxAccId();
//        String newAccId = idGenerator.generateNextId("ACC", maxAccId);

        Long seqVal = accRepository.getNextAccSeq();   // 오라클 시퀀스 호출
        String newAccId = idGenerator.generateNextId("ACC", seqVal);

        Acc acc = Acc.builder()
                .accId(newAccId)
                .contentId(dto.getContentId())
                .title(dto.getTitle())
                .category(dto.getCat3())
                .tel(dto.getTel())
                .townshipId(1)  // 임시값
                .address(dto.getAddr1() + dto.getAddr2())
                .mapy(dto.getMapy())
                .mapx(dto.getMapx())
                .createdTime(LocalDateTime.now())
                .modifiedTime(LocalDateTime.now())
                .build();

        accRepository.save(acc);
    }



}
