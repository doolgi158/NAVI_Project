package com.navi.common.config.kakao;

import com.navi.common.config.kakao.KakaoGeoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/kakao")
public class KakaoGeoController {
    private final KakaoGeoService kakaoGeoService;

    @GetMapping("/preview")
    public String preview(@RequestParam String address) {
        return kakaoGeoService.previewGeoJson(address);
    }
}