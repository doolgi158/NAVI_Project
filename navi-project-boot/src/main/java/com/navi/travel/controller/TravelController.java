package com.navi.travel.controller;

import com.navi.travel.domain.Travel;
import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.service.TravelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/travel")
@RequiredArgsConstructor
public class TravelController {
    private final TravelService travelService;

    // 제주도 여행정보 리스트 화면 (페이지네이션 적용)
    @GetMapping
    public Page<TravelListResponseDTO> getList(
            @PageableDefault(
                    size = 10,
                    sort = "contentsCd,asc,updatedAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable,
            // ⭐️ [수정] String으로 받습니다.
            @RequestParam(value = "region2Name", required = false) String region2NameCsv,
            @RequestParam(value = "categoryName", required = false) String categoryName
    ) {

        // ⭐️ [핵심 로직 변경] List<String> 대신 null 또는 파싱된 List를 할당합니다.
        List<String> region2Names = null;

        if (region2NameCsv != null && !region2NameCsv.isEmpty()) {
            region2Names = Arrays.stream(region2NameCsv.split(","))
                    .map(String::trim) // 띄어쓰기 문제 방지
                    .filter(s -> !s.isEmpty()) // 빈 문자열 제거
                    .collect(Collectors.toList());

            // 파싱 결과가 비어있으면 null로 재설정하여 서비스에서 전체 조회가 되도록 유도
            if (region2Names.isEmpty()) {
                region2Names = null;
            }
        }
        // -------------------------------------------------------------

        return travelService.getTravelList(pageable, region2Names, categoryName);
    }

    //상세내용 화면
    @GetMapping("/detail/{travelId}")
    public ResponseEntity<TravelDetailResponseDTO> getTravelDetail(@PathVariable("travelId") Long travelId) {
        try {
            TravelDetailResponseDTO detailDTO = travelService.getTravelDetail(travelId);
            return ResponseEntity.ok(detailDTO);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("상세 정보 조회 중 서버 오류 발생: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/views/{travelId}")
    public ResponseEntity<Void> incrementViews(@PathVariable("travelId") Long travelId) {
        try {
            travelService.incrementViews(travelId);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("조회수 증가 중 서버 오류 발생: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/load_save")
    public String load_save() {
        try{
            int count = travelService.saveApiData();
            return "API 데이터 저장 완료 총 "+count+" 건 처리됨.";
        } catch (Exception e) {
            e.printStackTrace();
            return "API 데이터 저장 중 오류 발생: "+ e.getMessage();
        }
    }

}