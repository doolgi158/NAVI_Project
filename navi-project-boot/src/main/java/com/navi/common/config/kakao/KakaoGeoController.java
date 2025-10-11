package com.navi.common.config.kakao;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * ======================================================
 * [KakaoGeoController]
 * : Kakao 주소 → 좌표 변환 테스트/미리보기용 컨트롤러
 * ------------------------------------------------------
 * 예시 요청:
 *   /api/kakao/preview?address=서귀포시+서호호근로46번길+68&title=제주M리조트
 * ======================================================
 */

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/kakao")
public class KakaoGeoController {

    private final KakaoGeoService kakaoGeoService;

    /**
     * ======================================================
     * [preview]
     * : 주소 또는 숙소명을 기반으로 Kakao Local API 변환 결과 미리보기
     * ------------------------------------------------------
     * Params:
     *   - address : 주소 문자열
     *   - title   : 숙소명(옵션)
     * ======================================================
     */
    @GetMapping("/preview")
    public String preview(
            @RequestParam String address,
            @RequestParam(required = false) String title
    ) {
        return kakaoGeoService.previewGeoJson(address, title);
    }
}
