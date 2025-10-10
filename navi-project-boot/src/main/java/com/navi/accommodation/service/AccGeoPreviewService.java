package com.navi.accommodation.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.repository.AccRepository;
import com.navi.common.config.kakao.GeoResult;
import com.navi.common.config.kakao.KakaoGeoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccGeoPreviewService {

    private final AccRepository accRepository;    // 숙소 DB 접근
    private final KakaoGeoService kakaoGeoService; // Kakao API 호출
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 변환용

    /**
     * ============================================
     * [previewAllGeoData]
     * : DB에 저장된 숙소 주소 기반으로 Kakao API 변환 미리보기
     * ============================================
     */
    public String previewAllGeoData() {
        List<Acc> accList = accRepository.findAll();

        if (accList.isEmpty()) {
            return "{ \"message\": \"등록된 숙소 데이터가 없습니다.\" }";
        }

        List<Map<String, Object>> resultList = new ArrayList<>();

        for (Acc acc : accList) {
            String address = acc.getAddress();
            if (address == null || address.isBlank()) {
                continue;
            }

            GeoResult geo = kakaoGeoService.getCoordinatesAndTownship(address);
            if (geo == null) {
                continue;
            }

            // 하나의 숙소 결과를 JSON으로 표현하기 위한 Map
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("accNo", acc.getAccNo());
            data.put("title", acc.getTitle());
            data.put("address", address);
            data.put("mapx", geo.getMapx());
            data.put("mapy", geo.getMapy());
            data.put("townshipName", geo.getTownshipName());

            resultList.add(data);
        }

        try {
            // JSON 문자열로 변환 (pretty print)
            return objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(resultList);
        } catch (Exception e) {
            log.error("JSON 변환 중 오류: {}", e.getMessage());
            return "{ \"error\": \"JSON 변환 실패\" }";
        }
    }
}
