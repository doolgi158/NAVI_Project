package com.navi.travel.controller;

import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.service.TravelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/travel")
@RequiredArgsConstructor
public class TravelController {

    private final TravelService travelService;

    // --------------------------------------------------------------------
    //                 ✅ 사용자(Public) API 영역 (state=1 공개 항목만 처리)
    // --------------------------------------------------------------------

    // 1. 여행지 목록 조회 (사용자용: 공개(state=1)된 항목만 조회)
//    @GetMapping
//    public Page<TravelListResponseDTO> getList(
//            @PageableDefault(
//                    size = 10,
//                    sort = "contentsCd",
//                    direction = Sort.Direction.DESC
//            ) Pageable pageable,
//            @RequestParam(value = "region2Name", required = false) String region2NameCsv,
//            @RequestParam(value = "categoryName", required = false) String categoryName,
//            @RequestParam(value = "search", required = false) String search
//    ) {
//        List<String> region2Names = null;
//
//        if (region2NameCsv != null && !region2NameCsv.isEmpty()) {
//            region2Names = Arrays.stream(region2NameCsv.split(","))
//                    .map(String::trim)
//                    .filter(s -> !s.isEmpty())
//                    .collect(Collectors.toList());
//
//            if (region2Names.isEmpty()) {
//                region2Names = null;
//            }
//        }
//
//        // 'publicOnly=true'를 전달하여 공개 상태(state=1) 항목만 조회
//        return travelService.getTravelList(pageable, region2Names, categoryName, search, true);
//    }

    // 2. 상세내용 조회 (사용자/공통)
//    @GetMapping("/detail/{travelId}")
//    public ResponseEntity<TravelDetailResponseDTO> getTravelDetail(@PathVariable("travelId") Long travelId) {
//        String id = "navi38"; // 임시 사용자 ID
//
//        try {
//            TravelDetailResponseDTO detailDTO = travelService.getTravelDetail(travelId, id);
//            return ResponseEntity.ok(detailDTO);
//        } catch (NoSuchElementException e) {
//            return ResponseEntity.notFound().build();
//        } catch (Exception e) {
//            System.err.println("상세 정보 조회 중 서버 오류 발생: " + e.getMessage());
//            return ResponseEntity.internalServerError().build();
//        }
//    }

    // 3. 조회수 증가
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

    // 4. 좋아요 토글
//    @PostMapping("/like/{travelId}")
//    public ResponseEntity<String> toggleLike(@PathVariable Long travelId) {
//        String id = "navi38"; // 임시 사용자 ID
//
//        try {
//            boolean isAdded = travelService.toggleLike(travelId, id);
//            // ... (응답 로직 유지)
//            if (isAdded) {
//                return ResponseEntity.status(HttpStatus.CREATED).body("좋아요가 성공적으로 추가되었습니다.");
//            } else {
//                return ResponseEntity.ok("좋아요가 성공적으로 취소되었습니다.");
//            }
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//        } catch (Exception e) {
//            System.err.println("좋아요 처리 중 서버 오류 발생: " + e.getMessage());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류: " + e.getMessage());
//        }
//    }

    // 5. 북마크 토글
//    @PostMapping("/bookmark/{travelId}")
//    public ResponseEntity<String> toggleBookmark(@PathVariable Long travelId) {
//        String id = "navi38"; // 임시 사용자 ID
//
//        try {
//            boolean isAdded = travelService.toggleBookmark(travelId, id);
//            // ... (응답 로직 유지)
//            if (isAdded) {
//                return ResponseEntity.status(HttpStatus.CREATED).body("북마크가 성공적으로 추가되었습니다.");
//            } else {
//                return ResponseEntity.ok("북마크가 성공적으로 취소되었습니다.");
//            }
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//        } catch (Exception e) {
//            System.err.println("북마크 처리 중 서버 오류 발생: " + e.getMessage());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류: " + e.getMessage());
//        }
//    }
}