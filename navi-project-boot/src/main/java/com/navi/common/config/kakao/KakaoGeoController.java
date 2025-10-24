package com.navi.common.config.kakao;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/* =============[KakaoGeoController]=============
     Kakao 주소 → 좌표 변환 테스트/미리보기용 컨트롤러
   ============================================== */

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/kakao")
public class KakaoGeoController {
    private final KakaoGeoService kakaoGeoService;

    @GetMapping("/preview")
    public String preview(
            @RequestParam String address,
            @RequestParam(required = false) String title
    ) {
        return kakaoGeoService.previewGeoJson(address, title);
    }
}
