package com.navi.travel.controller;

import com.navi.travel.dto.TravelDetailResponseDTO;
import com.navi.travel.dto.TravelListResponseDTO;
import com.navi.travel.dto.TravelRequestDTO;
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

    // ✅ 제주도 여행정보 리스트 화면 (페이지네이션 적용)
    @GetMapping
    public Page<TravelListResponseDTO> getList(
            @PageableDefault(
                    size = 10,
                    sort = "contentsCd,asc,updatedAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable,
            @RequestParam(value = "region2Name", required = false) String region2NameCsv,
            @RequestParam(value = "categoryName", required = false) String categoryName,
            @RequestParam(value = "search", required = false) String search
    ) {
        List<String> region2Names = null;

        if (region2NameCsv != null && !region2NameCsv.isEmpty()) {
            region2Names = Arrays.stream(region2NameCsv.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());

            if (region2Names.isEmpty()) {
                region2Names = null;
            }
        }

        return travelService.getTravelList(pageable, region2Names, categoryName, search);
    }

    // ✅ 상세내용 화면 (id String 타입으로 전달)
    @GetMapping("/detail/{travelId}")
    public ResponseEntity<TravelDetailResponseDTO> getTravelDetail(@PathVariable("travelId") Long travelId) {
        // ⚠️ 임시 사용자 ID 설정: navi38 임의값인 "navi38" 사용 (String 타입)
        String id = "navi38"; // navi38 임의 사용자 ID (추후 JWT 연동 필요)

        try {
            // id를 서비스 메서드에 전달 (서비스 시그니처도 String으로 변경 필요)
            TravelDetailResponseDTO detailDTO = travelService.getTravelDetail(travelId, id);
            return ResponseEntity.ok(detailDTO);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("상세 정보 조회 중 서버 오류 발생: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ✅ 조회수 증가
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

    // ✅ 좋아요 토글 (id String 타입으로 변경)
    @PostMapping("/like/{travelId}")
    public ResponseEntity<String> toggleLike(@PathVariable Long travelId) {
        String id = "navi38"; // String 타입으로 변경 및 "navi38" 사용

        try {
            // id를 서비스 메서드에 전달 (서비스 시그니처도 String으로 변경 필요)
            boolean isAdded = travelService.toggleLike(travelId, id);

            if (isAdded) {
                return ResponseEntity.status(HttpStatus.CREATED).body("좋아요가 성공적으로 추가되었습니다.");
            } else {
                return ResponseEntity.ok("좋아요가 성공적으로 취소되었습니다.");
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            System.err.println("좋아요 처리 중 서버 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류: " + e.getMessage());
        }
    }

    // ✅ 북마크 토글 (id String 타입으로 변경)
    @PostMapping("/bookmark/{travelId}")
    public ResponseEntity<String> toggleBookmark(@PathVariable Long travelId) {
        String id = "navi38"; // String 타입으로 변경 및 "navi38" 사용

        try {
            // id를 서비스 메서드에 전달 (서비스 시그니처도 String으로 변경 필요)
            boolean isAdded = travelService.toggleBookmark(travelId, id);

            if (isAdded) {
                return ResponseEntity.status(HttpStatus.CREATED).body("북마크가 성공적으로 추가되었습니다.");
            } else {
                return ResponseEntity.ok("북마크가 성공적으로 취소되었습니다.");
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            System.err.println("북마크 처리 중 서버 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류: " + e.getMessage());
        }
    }

    // ✅ API 데이터 저장
    @PostMapping("/load_save")
    public String load_save() {
        try {
            int count = travelService.saveApiData();
            return "API 데이터 저장 완료 총 " + count + " 건 처리됨.";
        } catch (Exception e) {
            e.printStackTrace();
            return "API 데이터 저장 중 오류 발생: " + e.getMessage();
        }
    }
    // ✅ 여행지 등록/수정
    @PostMapping("/admin")
    // @Secured("ROLE_ADMIN") // Spring Security 적용 시 권한 체크 추가
    public ResponseEntity<TravelListResponseDTO> saveOrUpdateTravel(@RequestBody TravelRequestDTO dto) {
        try {
            TravelListResponseDTO response = travelService.saveTravel(dto);

            // 등록(travelId가 null)이면 201 Created, 수정(travelId가 not null)이면 200 OK
            HttpStatus status = (dto.getTravelId() == null) ? HttpStatus.CREATED : HttpStatus.OK;

            return ResponseEntity.status(status).body(response);
        } catch (NoSuchElementException e) {
            // 수정 시 해당 ID의 여행지가 없는 경우
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            System.err.println("여행지 저장/수정 중 서버 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ 여행지 삭제 (Admin CRUD: Delete)
    @DeleteMapping("/admin/{travelId}")
    // @Secured("ROLE_ADMIN") // Spring Security 적용 시 권한 체크 추가
    public ResponseEntity<Void> deleteTravel(@PathVariable Long travelId) {
        try {
            travelService.deleteTravel(travelId);
            // 성공적인 삭제는 보통 204 No Content로 응답합니다.
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (NoSuchElementException e) {
            // 삭제 대상이 없는 경우
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            System.err.println("여행지 삭제 중 서버 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}