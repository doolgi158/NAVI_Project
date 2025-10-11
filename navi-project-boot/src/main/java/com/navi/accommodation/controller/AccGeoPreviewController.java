package com.navi.accommodation.controller;

import com.navi.accommodation.service.AccGeoPreviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ======================================================
 * [AccGeoPreviewController]
 * : Kakao Geo 변환 결과를 JSON 파일 형태로 미리보기
 * ------------------------------------------------------
 * 예시 요청:
 *   GET /api/admin/geo/preview
 *   (→ 브라우저/포스트맨에서 JSON 파일로 바로 확인 가능)
 * ======================================================
 */

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AccGeoPreviewController {

    private final AccGeoPreviewService accGeoPreviewService;

    /** ✅ Kakao Geo 변환 미리보기 (JSON 파일 응답) */
    @GetMapping("/geo/preview")
    public ResponseEntity<String> previewGeo() {
        String json = accGeoPreviewService.previewAllGeoData();

        // 응답 헤더 설정 → JSON 파일처럼 인식되게끔
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"geo_preview.json\"");

        return ResponseEntity.ok()
                .headers(headers)
                .body(json);
    }
}
