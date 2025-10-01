package com.navi.accommodation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccApiDTO;
import com.navi.accommodation.repository.AccRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AccServiceImpl implements AccService{
    public final AccRepository accRepository;
    public final ObjectMapper objectMapper;

    //JSON 파일 경로 지정
    @Value("classpath:accMockData/acc_list.json")   // 숙소 전체 리스트
    private Resource listFile;
    @Value("classpath:accMockData/acc_basic.json")  // 특정 숙소 정보
    private Resource basicFile;
    @Value("classpath:accMockData/acc_extra.json")  // 특정 숙소 추가 정보
    private Resource extraFile;

    @Override
    public void loadFromJsonFile() throws IOException {
        JsonNode root = objectMapper.readTree(listFile.getInputStream());
        JsonNode items = root.path("response").path("body").path("items");

        for(JsonNode wrapper : items) {
            JsonNode item = wrapper.path("item");

            // JSON -> DTO 변환
            AccApiDTO dto = objectMapper.treeToValue(item, AccApiDTO.class);
            // DTO -> Entity 저장
            insertDTOFromApi(dto);
        }
    }

    @Override
    public void updateFromJsonFile() throws IOException {

    }

    public void processJson(Resource file, boolean insertOnly) throws IOException {
        JsonNode root = objectMapper.readTree(file.getInputStream());
        JsonNode items = root.path("response").path("body").path("items");

//        for(JsonNode wrapper : items){
//            JsonNode item = wrapper.path("item");
//            AccApiDTO dto = objectMapper.treeToValue(item, AccApiDTO.class);
//
//            accRepository.findByContentId(dto.getContentId())
//                    .ifPresentOrElse(acc -> {
//
//                    });
//        }
    }

    @Override
    public void insertDTOFromApi(AccApiDTO dto) {
        Acc acc = Acc.builder()
                .contentId(dto.getContentId())
                .title(dto.getTitle())
                .category(dto.getCat3())
                .tel(dto.getTel())
                .townshipId(1)  // 임시값
                .address(dto.getAddr1() + (dto.getAddr2() != null ? dto.getAddr2() : ""))
                .mapy(dto.getMapy())
                .mapx(dto.getMapx())
                .createdTime(LocalDateTime.now())
                .modifiedTime(LocalDateTime.now())
                .build();

        accRepository.save(acc);
    }
}
